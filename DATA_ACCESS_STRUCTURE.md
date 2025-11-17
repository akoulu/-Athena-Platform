# Data Access Library Structure

## Issue

The `data-access/demographics-api` directory already contains an Angular library. For the NestJS backend version, we have two options:

## Option 1: Subdirectory Structure (Recommended)

Create the NestJS library in a subdirectory:

```bash
nx g @nx/nest:library \
  --name=data-access-demographics-api-nest \
  --directory=libs/org/data-access/demographics-api/nest \
  --tags=scope:org,type:lib,type:data-access,domain:demographics \
  --unitTestRunner=jest
```

**Structure:**

```
libs/org/data-access/demographics-api/
├── src/                    # Angular frontend library
├── nest/                   # NestJS backend library
│   ├── src/
│   └── project.json
└── project.json            # Angular library config
```

## Option 2: Separate Directories

Create separate directories for Angular and NestJS:

```bash
# Angular (already exists)
libs/org/data-access/demographics-api/

# NestJS (create new)
nx g @nx/nest:library \
  --name=data-access-demographics-api-nest \
  --directory=libs/org/data-access/demographics-api-nest \
  --tags=scope:org,type:lib,type:data-access,domain:demographics \
  --unitTestRunner=jest
```

**Structure:**

```
libs/org/data-access/
├── demographics-api/       # Angular frontend
└── demographics-api-nest/  # NestJS backend
```

## Recommendation

Use **Option 1** (subdirectory) because:

- Keeps related code together
- Clear separation (frontend vs backend)
- Easier to maintain shared types
- Follows the pattern used in feature domains

## After Creation

Remember to fix tags in `project.json`:

```json
"tags": ["scope:org", "type:lib", "type:data-access", "domain:demographics"]
```
