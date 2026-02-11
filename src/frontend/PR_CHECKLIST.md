# Pull Request Checklist

Before submitting a pull request, complete this checklist. Copy and paste into your PR description:

---

## Change Control Checklist

I have reviewed the [Change Control Policy](./CHANGE_CONTROL_POLICY.md) and verified:

### Behavior Impact
- [ ] This change does NOT affect user authentication flow (or is documented)
- [ ] This change does NOT affect route navigation or URLs (or is documented)
- [ ] This change does NOT affect backend API calls (or is documented)
- [ ] This change does NOT affect data persistence or state management (or is documented)

### Route Impact (if applicable)
- [ ] All routes are still defined in `frontend/src/App.tsx`
- [ ] All navigation links are updated to match route changes
- [ ] All routes render without blank screens
- [ ] Default route (`/`) is properly configured

### Backend API Impact (if applicable)
- [ ] Backend method signatures are unchanged (or documented in CHANGELOG.md)
- [ ] React Query hooks are updated to match backend changes
- [ ] Error responses are handled correctly
- [ ] Loading states are displayed properly

### State & Schema Impact (if applicable)
- [ ] Data structures passed to/from backend are unchanged (or documented)
- [ ] TypeScript types are updated to match backend types
- [ ] All components using affected data structures are updated

### Quality Gates
- [ ] All quality gates pass: `cd frontend && npm run gates`
- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint passes with no errors
- [ ] Prettier formatting is correct

### Manual Testing
- [ ] Tested login/logout cycle
- [ ] Navigated to all affected routes and verified they render
- [ ] Tested at least one complete user flow
- [ ] Verified error states display correctly

### Documentation
- [ ] Updated CHANGELOG.md with changes
- [ ] Updated version in `frontend/src/version.ts` (if releasing)
- [ ] Updated README files (if behavior changed)

---

## Description
[Describe your changes here]

## Testing
[Describe how you tested these changes]

## Screenshots (if applicable)
[Add screenshots here]
