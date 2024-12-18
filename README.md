# botActivities
## Project's name: Login system using PostgreSQL
## Project's description: Simple TypeScript project using Apollo Server, GraphQL and PostgreSQL

## Environment and tools:
- Container: Docker
- Language: TypeScript
- ORM: Prisma
- Data consulting: GraphQL, Apollo and PopSQL
- Seeding: Snaplet
- Testing: Mocha

## Steps to run and debug:
### Get dependencies
```bash
npm install
```
### Run the docker-compose command to create the container
```bash
docker-compose up -d
```
### Add the .env file with the url to the database

### Configure the snaplet client
```bash
npx @snaplet/seed init
npx @snaplet/seed sync
```
### Run the code with the command below or use the platform of your choice to see the data
```bash
npm run start
```
