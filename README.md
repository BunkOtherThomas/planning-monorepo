# Quest Board

Quest Board is a gamified project management platform that helps teams and individuals track their progress while developing valuable skills. By combining the principles of RPGs with project management, Quest Board makes task completion more engaging and helps teams better understand and utilize their collective skills.

## Features

- **Skill-Based Task Management**: Create and assign tasks with associated skill requirements
- **Experience Points (XP) System**: Gain XP in specific skills as you complete tasks
- **Skill Leveling**: Level up your skills through consistent task completion
- **Skill Tagging**: Tag your preferred or proficient skills to earn bonus XP
- **Team Skill Analytics**: Track and visualize team members' skill development
- **Task Assignment Optimization**: Match tasks with team members based on skill levels

## Project Structure

This is a monorepo built with Turborepo, containing the following applications and packages:

### Applications
- `apps/quest-board-web`: Frontend web application built with Next.js
- `apps/quest-board-api`: Backend API service built with Next.js API routes

### Shared Packages
- `packages/database`: Database schema and utilities
- `packages/types`: Shared TypeScript types between frontend and backend

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd planning-monorepo
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `apps/quest-board-web` and `apps/quest-board-api`
   - Update the variables with your configuration

4. Start the development servers:
```bash
turbo dev
```

This will start both the frontend and backend applications in development mode.

## Development

### Available Scripts

- `turbo dev`: Start all applications in development mode
- `turbo build`: Build all applications and packages
- `turbo test`: Run tests across all applications
- `turbo lint`: Run linting across all applications

### Database Migrations

To run database migrations:
```bash
cd apps/quest-board-api
turbo prisma migrate dev
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Add your license information here]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Monorepo management with [Turborepo](https://turbo.build/repo)
- Database management with [Prisma](https://www.prisma.io/)
