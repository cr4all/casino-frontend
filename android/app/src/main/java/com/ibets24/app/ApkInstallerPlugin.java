package com.ibets24.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {

    private static final long MAX_BYTES = 200L * 1024L * 1024L;

    @PluginMethod
    public void install(PluginCall call) {
        String url = call.getString("url");
        if (!isHttps(url)) {
            call.reject("HTTPS download URL is required");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            && !getContext().getPackageManager().canRequestPackageInstalls()) {
            openUnknownSourcesSettings();
            call.reject("Install from unknown sources is disabled");
            return;
        }

        if (getActivity() == null) {
            call.reject("App is not in the foreground");
            return;
        }

        execute(() -> {
            File file = new File(getContext().getCacheDir(), "app-update.apk");
            try {
                download(url, file);
            } catch (IOException exception) {
                if (file.exists() && !file.delete()) {
                    file.deleteOnExit();
                }
                call.reject(exception.getMessage() != null ? exception.getMessage() : "Download failed");
                return;
            }

            android.app.Activity activity = getActivity();
            if (activity == null) {
                call.reject("App is not in the foreground");
                return;
            }

            activity.runOnUiThread(() -> {
                try {
                    Uri uri = FileProvider.getUriForFile(
                        getContext(),
                        getContext().getPackageName() + ".fileprovider",
                        file
                    );
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(uri, "application/vnd.android.package-archive");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                    call.resolve();
                } catch (RuntimeException exception) {
                    call.reject(exception.getMessage() != null ? exception.getMessage() : "Unable to open installer");
                }
            });
        });
    }

    private void openUnknownSourcesSettings() {
        if (getActivity() == null) {
            return;
        }

        Intent intent = new Intent(
            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
            Uri.parse("package:" + getContext().getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getActivity().runOnUiThread(() -> getContext().startActivity(intent));
    }

    private void download(String urlString, File destination) throws IOException {
        String current = urlString;
        for (int hop = 0; hop < 5; hop++) {
            URL url = new URL(current);
            if (!"https".equalsIgnoreCase(url.getProtocol())) {
                throw new IOException("HTTPS is required");
            }

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(15_000);
            connection.setReadTimeout(60_000);
            try {
                connection.connect();
                int status = connection.getResponseCode();
                if (status == HttpURLConnection.HTTP_MOVED_PERM
                    || status == HttpURLConnection.HTTP_MOVED_TEMP
                    || status == HttpURLConnection.HTTP_SEE_OTHER
                    || status == 307
                    || status == 308) {
                    String location = connection.getHeaderField("Location");
                    if (location == null || location.trim().isEmpty()) {
                        throw new IOException("Redirect without location");
                    }
                    current = new URL(url, location).toString();
                    continue;
                }

                if (status < 200 || status >= 300) {
                    throw new IOException("Download failed: " + status);
                }

                try (InputStream input = connection.getInputStream();
                    OutputStream output = new FileOutputStream(destination)) {
                    byte[] buffer = new byte[8192];
                    long total = 0;
                    int read;
                    while ((read = input.read(buffer)) != -1) {
                        total += read;
                        if (total > MAX_BYTES) {
                            throw new IOException("APK is too large");
                        }
                        output.write(buffer, 0, read);
                    }
                }
                return;
            } finally {
                connection.disconnect();
            }
        }

        throw new IOException("Too many redirects");
    }

    private static boolean isHttps(String url) {
        if (url == null) {
            return false;
        }
        try {
            return "https".equalsIgnoreCase(new URL(url).getProtocol());
        } catch (IOException exception) {
            return false;
        }
    }
}
