// Internal User model — what the UI components expect
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
}

// Fake Store API user shape
export interface FakeStoreUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
  address?: {
    geolocation: { lat: string; long: string };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  __v?: number;
}

export function fakeStoreUserToUser(fsu: FakeStoreUser): User {
  return {
    id: fsu.id,
    firstName: fsu.name.firstname,
    lastName: fsu.name.lastname,
    email: fsu.email,
    phoneNumber: fsu.phone,
    isActive: true,
  };
}

export function userToFakeStoreUser(user: User): Partial<FakeStoreUser> {
  return {
    id: user.id,
    email: user.email,
    phone: user.phoneNumber,
    name: {
      firstname: user.firstName,
      lastname: user.lastName,
    },
  };
}
