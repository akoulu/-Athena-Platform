# Users API Service

Angular service for managing users via the backend API.

## Usage

```typescript
import { UsersApiService } from '@org/data-access-users-api';

constructor(private usersApi: UsersApiService) {}

// Create a new user
this.usersApi.create({
  email: 'user@example.com',
  password: 'password123',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe'
}).subscribe(user => {
  console.log('User created:', user);
});

// Get all users with pagination and filters
this.usersApi.findAll({
  page: 1,
  limit: 10,
  search: 'john',
  role: 'admin',
  isActive: true
}).subscribe(response => {
  console.log('Users:', response.users);
  console.log('Total:', response.total);
});

// Get user by ID
this.usersApi.findOne('user-123').subscribe(user => {
  console.log('User:', user);
});

// Update user
this.usersApi.update('user-123', {
  firstName: 'Updated',
  lastName: 'Name'
}).subscribe(user => {
  console.log('User updated:', user);
});

// Delete user
this.usersApi.remove('user-123').subscribe(() => {
  console.log('User deleted');
});
```

## Methods

- `create(createUserDto: CreateUserDto): Observable<UserProfile>` - Create a new user
- `findAll(query?: UserQuery): Observable<UserListResponse>` - Get all users with optional filters
- `findOne(id: string): Observable<UserProfile>` - Get user by ID
- `update(id: string, updateUserDto: UpdateUserDto): Observable<UserProfile>` - Update user
- `remove(id: string): Observable<void>` - Delete user
