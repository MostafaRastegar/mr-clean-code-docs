# Cline Rules for Clean Code

This directory contains comprehensive clean code rules for JavaScript and TypeScript development, designed to be used as a code reviewer in Cline.

## Overview

These rules are automatically loaded by Cline and provide context-specific guidance for writing clean, maintainable code. Each rule file contains:

- **Conditional activation** based on file patterns
- **Practical examples** with before/after code
- **Code review checklists** for systematic evaluation
- **Best practices** tailored to specific coding scenarios

## Rule Files

### Universal Rules (Always Active)
- **[universal-standards.md](./universal-standards.md)** - General coding principles that apply to all JavaScript/TypeScript code

### Conditional Rules (Activate Based on File Patterns)

#### Code Quality Rules
- **[naming-conventions.md](./naming-conventions.md)** - Variable, function, class, and file naming guidelines
- **[function-design.md](./function-design.md)** - Function structure, arguments, and design principles
- **[class-design.md](./class-design.md)** - Class structure, SOLID principles, and design patterns

#### Development Practices
- **[error-handling.md](./error-handling.md)** - Error handling patterns and best practices
- **[testing.md](./testing.md)** - Unit, integration, and E2E testing guidelines
- **[code-organization.md](./code-organization.md)** - Architecture patterns and project structure

#### Performance & Security
- **[performance.md](./performance.md)** - Performance optimization techniques
- **[security.md](./security.md)** - Security best practices and secure coding

#### Documentation
- **[documentation.md](./documentation.md)** - Code comments, JSDoc, and documentation standards

## How Rules Work

### Conditional Activation

Rules activate automatically based on the files you're working with:

```yaml
---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---
```

**Examples:**
- Working with `src/components/UserList.tsx` → Activates naming, function, class, and organization rules
- Working with `src/services/userService.test.ts` → Activates testing rules
- Working with any JS/TS file → Activates universal standards

### Rule Structure

Each rule file contains:

1. **YAML Frontmatter** - Defines when the rule activates
2. **Rule Title** - Clear, actionable title
3. **Description** - What the rule covers
4. **Examples** - Before/after code examples
5. **Checklist** - Specific items to verify during code review

## Usage

### As a Code Reviewer

When reviewing code, these rules will automatically provide:

- **Specific feedback** based on the code type
- **Best practice suggestions** with examples
- **Checklist items** to verify compliance
- **Contextual guidance** for the specific scenario

### During Development

The rules help you:

- **Write better code** from the start
- **Follow consistent patterns** across your project
- **Catch issues early** before they become problems
- **Learn best practices** through examples

### Customization

You can:

- **Modify existing rules** to match your team's standards
- **Add new rules** for specific project requirements
- **Adjust file patterns** to target different code types
- **Create team-specific rules** for your organization

## Rule Activation Examples

### Frontend Development
When working with React components:
- Naming conventions for components and props
- Function design for hooks and event handlers
- Performance optimization for renders
- Security considerations for user input

### Backend Development
When working with API endpoints:
- Error handling patterns
- Security best practices
- Code organization for services
- Testing strategies for APIs

### Testing
When working with test files:
- Test structure and organization
- Mocking strategies
- Test naming conventions
- Coverage best practices

## Integration with Your Workflow

### Code Reviews
1. Rules automatically activate based on the files being reviewed
2. Reviewers get specific, actionable feedback
3. Consistent standards across the team
4. Educational value for team members

### Development
1. Real-time guidance as you code
2. Consistent patterns across the codebase
3. Early detection of potential issues
4. Learning opportunities through examples

### Onboarding
1. New team members learn best practices
2. Consistent code quality from day one
3. Reduced need for extensive code review
4. Faster ramp-up time

## Contributing

### Adding New Rules
1. Create a new `.md` file in this directory
2. Add YAML frontmatter with file patterns
3. Include practical examples and checklists
4. Follow the established structure

### Modifying Existing Rules
1. Update the rule content to match your standards
2. Ensure examples are relevant and accurate
3. Test rule activation with different file patterns
4. Consider team feedback and preferences

### Best Practices for Rule Creation
- **Be specific** - Provide clear, actionable guidance
- **Include examples** - Show before/after code
- **Focus on impact** - Prioritize high-value rules
- **Keep it practical** - Focus on real-world scenarios
- **Test thoroughly** - Verify rules work as expected

## Technical Details

### File Pattern Matching
Uses glob patterns for flexible file matching:
- `**/*.js` - All JavaScript files recursively
- `src/**/*.ts` - TypeScript files in src directory
- `**/*.test.*` - Test files with any extension

### Rule Priority
- Universal rules always activate
- Conditional rules activate based on file patterns
- Multiple rules can activate simultaneously
- Rules are evaluated in file system order

### Performance
- Rules are loaded efficiently
- Pattern matching is optimized
- No impact on development performance
- Lightweight and fast activation

## Support

For questions or issues with these rules:

1. **Check the examples** in each rule file
2. **Review the YAML patterns** for activation
3. **Test with different file types** to verify behavior
4. **Consult the Cline documentation** for advanced features

## License

These rules are part of the clean-code-rules project and follow the same licensing terms.