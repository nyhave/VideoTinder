# Contribution Guidance

Before committing any code changes:

1. **Run tests** – execute `npm test` from the repository root. All tests should pass.
2. **Avoid duplicate exports** – when creating a new function, search the project to confirm it isn't already exported elsewhere. Duplicate exports are a common mistake.
3. **Ensure color contrast** – button text should be clearly visible against its background. Explicitly set text colors when altering button backgrounds to avoid low-contrast combinations.
