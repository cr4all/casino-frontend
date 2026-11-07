import { describe, expect, it } from 'vitest';
import { activeBonusTitle } from './activeBonusTitle';

const promotionLabel = 'Promotion Bonus';
const fallback = 'Bonus';

describe('activeBonusTitle', () => {
  it('uses the generic promotion label instead of the admin policy name', () => {
    expect(
      activeBonusTitle(
        { type: 'promotion', policy_name: 'aff01' },
        promotionLabel,
        fallback,
      ),
    ).toBe(promotionLabel);
  });

  it('keeps the policy name for other bonus types', () => {
    expect(
      activeBonusTitle(
        { type: 'welcome', policy_name: 'Welcome Offer' },
        promotionLabel,
        fallback,
      ),
    ).toBe('Welcome Offer');
  });

  it('falls back when a non-promotion bonus has no name', () => {
    expect(
      activeBonusTitle({ type: 'reload', policy_name: '   ' }, promotionLabel, fallback),
    ).toBe(fallback);
  });
});
