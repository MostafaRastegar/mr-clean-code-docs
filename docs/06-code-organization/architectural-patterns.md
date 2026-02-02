# Architectural Patterns

## Overview

Architectural patterns provide proven solutions to common software design problems. They help organize code into logical structures that are maintainable, scalable, and testable. This document covers popular architectural patterns for JavaScript and TypeScript applications.

## Common Architectural Patterns

### 1. Model-View-Controller (MVC)

**Overview:**
MVC separates an application into three interconnected components:
- **Model**: Manages data and business logic
- **View**: Handles user interface and presentation
- **Controller**: Manages user input and coordinates between Model and View

**Implementation Example:**
```typescript
// Model
class UserModel {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  validate(): boolean {
    return this.email.includes('@');
  }
}

// View
class UserView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(user: UserModel): void {
    this.container.innerHTML = `
      <div>
        <h2>${user.name}</h2>
        <p>Email: ${user.email}</p>
      </div>
    `;
  }

  showError(message: string): void {
    this.container.innerHTML = `<div class="error">${message}</div>`;
  }
}

// Controller
class UserController {
  private model: UserModel;
  private view: UserView;

  constructor(model: UserModel, view: UserView) {
    this.model = model;
    this.view = view;
  }

  updateUser(userData: { name: string; email: string }): void {
    this.model.name = userData.name;
    this.model.email = userData.email;

    if (this.model.validate()) {
      this.view.render(this.model);
    } else {
      this.view.showError('Invalid email address');
    }
  }
}

// Usage
const user = new UserModel('1', 'John Doe', 'john@example.com');
const view = new UserView(document.getElementById('user-container')!);
const controller = new UserController(user, view);
```

**Advantages:**
- Clear separation of concerns
- Easy to test individual components
- Promotes code reusability

**Disadvantages:**
- Can be overkill for simple applications
- View and Controller can become tightly coupled

### 2. Model-View-Presenter (MVP)

**Overview:**
MVP is a variation of MVC where the Presenter acts as a middleman between Model and View, handling all presentation logic.

**Implementation Example:**
```typescript
// Model
interface IUserModel {
  id: string;
  name: string;
  email: string;
  save(): Promise<void>;
}

// View Interface
interface IUserView {
  showUser(user: IUserModel): void;
  showError(message: string): void;
  setLoading(loading: boolean): void;
}

// Presenter
class UserPresenter {
  private model: IUserModel;
  private view: IUserView;

  constructor(model: IUserModel, view: IUserView) {
    this.model = model;
    this.view = view;
  }

  async loadUser(userId: string): Promise<void> {
    this.view.setLoading(true);
    try {
      // Fetch user from API or database
      const user = await this.model.save();
      this.view.showUser(user);
    } catch (error) {
      this.view.showError('Failed to load user');
    } finally {
      this.view.setLoading(false);
    }
  }

  async saveUser(userData: Partial<IUserModel>): Promise<void> {
    this.view.setLoading(true);
    try {
      this.model.name = userData.name || this.model.name;
      this.model.email = userData.email || this.model.email;
      await this.model.save();
      this.view.showUser(this.model);
    } catch (error) {
      this.view.showError('Failed to save user');
    } finally {
      this.view.setLoading(false);
    }
  }
}
```

**Advantages:**
- Better separation than MVC
- Easier to unit test
- View is completely passive

**Disadvantages:**
- More complex than MVC
- Can lead to large Presenter classes

### 3. Model-View-ViewModel (MVVM)

**Overview:**
MVVM uses data binding to synchronize the View and ViewModel automatically. Popular in frameworks like Vue.js and Angular.

**Implementation Example:**
```typescript
// Model
class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}
}

// ViewModel
class UserViewModel {
  private user: User;
  public name: string;
  public email: string;
  public isValid: boolean = false;

  constructor(user: User) {
    this.user = user;
    this.name = user.name;
    this.email = user.email;
    this.validate();
  }

  private validate(): void {
    this.isValid = this.email.includes('@') && this.name.length > 0;
  }

  updateName(name: string): void {
    this.name = name;
    this.validate();
    this.notifyPropertyChanged('name');
    this.notifyPropertyChanged('isValid');
  }

  updateEmail(email: string): void {
    this.email = email;
    this.validate();
    this.notifyPropertyChanged('email');
    this.notifyPropertyChanged('isValid');
  }

  async save(): Promise<void> {
    if (!this.isValid) {
      throw new Error('Invalid user data');
    }

    this.user.name = this.name;
    this.user.email = this.email;

    // Save to API/database
    await this.saveUser(this.user);
  }

  private notifyPropertyChanged(propertyName: string): void {
    // Trigger view update (implementation depends on framework)
    if (this.onPropertyChanged) {
      this.onPropertyChanged(propertyName);
    }
  }

  private onPropertyChanged?: (propertyName: string) => void;

  subscribe(callback: (propertyName: string) => void): void {
    this.onPropertyChanged = callback;
  }
}
```

**Advantages:**
- Automatic data binding
- Clean separation of concerns
- Easy to test ViewModel independently

**Disadvantages:**
- Learning curve for data binding
- Can be complex for simple applications

### 4. Clean Architecture

**Overview:**
Clean Architecture separates concerns into concentric layers, with dependencies pointing inward. The core business logic is independent of frameworks and databases.

**Layer Structure:**
```
┌─────────────────────────────────────┐
│           Framework Layer           │  ← External frameworks, databases
├─────────────────────────────────────┤
│          Interface Adapters         │  ← Controllers, presenters, gateways
├─────────────────────────────────────┤
│           Use Cases Layer           │  ← Application business rules
├─────────────────────────────────────┤
│           Entities Layer            │  ← Enterprise business rules
└─────────────────────────────────────┘
```

**Implementation Example:**
```typescript
// Entities Layer (Enterprise Business Rules)
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

class UserRegistrationUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(userData: CreateUserRequest): Promise<User> {
    // Business logic
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email');
    }

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new UserEntity(userData.name, userData.email);
    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(user.email);

    return user.toDTO();
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@');
  }
}

// Use Cases Layer (Application Business Rules)
interface CreateUserRequest {
  name: string;
  email: string;
}

// Interface Adapters Layer
interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface EmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

// Framework Layer
class DatabaseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Database implementation
  }

  async save(user: User): Promise<void> {
    // Database implementation
  }
}

class SMTPEmailService implements EmailService {
  async sendWelcomeEmail(email: string): Promise<void> {
    // SMTP implementation
  }
}
```

**Advantages:**
- Independent of frameworks and databases
- Testable business logic
- Clear separation of concerns
- Easy to maintain and extend

**Disadvantages:**
- More complex initial setup
- Can be overkill for simple applications
- Requires discipline to maintain boundaries

### 5. Domain-Driven Design (DDD)

**Overview:**
DDD focuses on modeling the software based on the real-world domain. It emphasizes collaboration between technical and domain experts.

**Core Concepts:**
- **Entities**: Objects with identity that persist over time
- **Value Objects**: Objects defined by their attributes
- **Aggregates**: Clusters of related objects treated as a unit
- **Repositories**: Collections of aggregates
- **Services**: Operations that don't naturally belong to entities
- **Domain Events**: Significant occurrences in the domain

**Implementation Example:**
```typescript
// Value Object
class Email {
  constructor(public readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email');
    }
  }

  private isValid(email: string): boolean {
    return email.includes('@');
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Entity
class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: Email
  ) {}

  updateEmail(newEmail: Email): void {
    this.email = newEmail;
    // Domain event could be raised here
  }
}

// Aggregate Root
class ShoppingCart {
  private items: CartItem[] = [];
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  addItem(product: Product, quantity: number): void {
    const existingItem = this.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push(new CartItem(product.id, product.name, product.price, quantity));
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}

// Repository
interface ShoppingCartRepository {
  findByUserId(userId: string): Promise<ShoppingCart | null>;
  save(cart: ShoppingCart): Promise<void>;
}

// Domain Service
class OrderService {
  constructor(
    private shoppingCartRepository: ShoppingCartRepository,
    private paymentService: PaymentService
  ) {}

  async checkout(userId: string, paymentMethod: PaymentMethod): Promise<Order> {
    const cart = await this.shoppingCartRepository.findByUserId(userId);
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = cart.getTotal();
    const paymentResult = await this.paymentService.processPayment(paymentMethod, total);

    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    // Create order from cart
    const order = new Order(userId, cart.items, total);
    
    // Clear cart
    cart.items = [];
    await this.shoppingCartRepository.save(cart);

    return order;
  }
}
```

**Advantages:**
- Models real-world complexity well
- Clear domain boundaries
- Promotes collaboration with domain experts
- Maintainable as domain evolves

**Disadvantages:**
- Complex for simple domains
- Requires domain expertise
- Can lead to over-engineering

### 6. Microservices Architecture

**Overview:**
Microservices architecture structures an application as a collection of loosely coupled services. Each service owns its data and implements specific business capabilities.

**Implementation Example:**
```typescript
// User Service
// services/user-service/src/index.ts
import express from 'express';
import { UserController } from './controllers/UserController';
import { UserService } from './services/UserService';
import { UserRepository } from './repositories/UserRepository';

const app = express();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

app.use(express.json());
app.post('/users', userController.createUser.bind(userController));
app.get('/users/:id', userController.getUser.bind(userController));

app.listen(3001, () => {
  console.log('User service running on port 3001');
});

// Order Service
// services/order-service/src/index.ts
import express from 'express';
import { OrderController } from './controllers/OrderController';
import { OrderService } from './services/OrderService';
import { OrderRepository } from './repositories/OrderRepository';
import { UserServiceClient } from './clients/UserServiceClient';

const app = express();
const orderRepository = new OrderRepository();
const userServiceClient = new UserServiceClient('http://user-service:3001');
const orderService = new OrderService(orderRepository, userServiceClient);
const orderController = new OrderController(orderService);

app.use(express.json());
app.post('/orders', orderController.createOrder.bind(orderController));
app.get('/orders/:id', orderController.getOrder.bind(orderController));

app.listen(3002, () => {
  console.log('Order service running on port 3002');
});

// API Gateway
// gateway/src/index.ts
import express from 'express';
import { ProxyController } from './controllers/ProxyController';

const app = express();
const proxyController = new ProxyController();

app.use('/api/users', proxyController.proxyToService.bind(proxyController, 'user-service', 3001));
app.use('/api/orders', proxyController.proxyToService.bind(proxyController, 'order-service', 3002));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
```

**Advantages:**
- Independent deployment and scaling
- Technology diversity
- Fault isolation
- Team autonomy

**Disadvantages:**
- Distributed system complexity
- Data consistency challenges
- Network latency
- Operational overhead

### 7. Component-Based Architecture

**Overview:**
Component-based architecture builds applications from reusable, self-contained components that can be composed together.

**Implementation Example:**
```typescript
// Base Component
abstract class Component<TProps = {}, TState = {}> {
  protected props: TProps;
  protected state: TState;
  protected element: HTMLElement;

  constructor(props: TProps, initialState: TState) {
    this.props = props;
    this.state = initialState;
    this.element = this.render();
  }

  abstract render(): HTMLElement;

  setState(newState: Partial<TState>): void {
    this.state = { ...this.state, ...newState };
    const newElement = this.render();
    this.element.replaceWith(newElement);
    this.element = newElement;
  }

  protected createElement(tag: string, props: any = {}, children: (HTMLElement | string)[] = []): HTMLElement {
    const element = document.createElement(tag);
    
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        (element as any)[key] = value;
      }
    });

    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  }
}

// Button Component
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

class Button extends Component<ButtonProps> {
  render(): HTMLElement {
    return this.createElement('button', {
      className: `btn btn-${this.props.variant || 'primary'}`,
      onClick: this.props.onClick
    }, [this.props.text]);
  }
}

// Form Component
interface FormProps {
  onSubmit: (data: FormData) => void;
}

interface FormState {
  fields: Record<string, string>;
  errors: Record<string, string>;
}

class Form extends Component<FormProps, FormState> {
  constructor(props: FormProps) {
    super(props, {
      fields: {},
      errors: {}
    });
  }

  render(): HTMLElement {
    const form = this.createElement('form', {
      onSubmit: (e: Event) => {
        e.preventDefault();
        this.props.onSubmit(new FormData(e.target as HTMLFormElement));
      }
    });

    // Add form fields dynamically
    Object.entries(this.state.fields).forEach(([name, value]) => {
      const field = this.createElement('div', { className: 'form-field' }, [
        this.createElement('label', { htmlFor: name }, [name]),
        this.createElement('input', {
          type: 'text',
          id: name,
          name,
          value,
          onChange: (e: Event) => this.handleFieldChange(name, (e.target as HTMLInputElement).value)
        })
      ]);

      if (this.state.errors[name]) {
        field.appendChild(this.createElement('span', { className: 'error' }, [this.state.errors[name]]));
      }

      form.appendChild(field);
    });

    form.appendChild(new Button({
      text: 'Submit',
      onClick: () => form.dispatchEvent(new Event('submit'))
    }).element);

    return form;
  }

  private handleFieldChange(name: string, value: string): void {
    this.setState({
      fields: { ...this.state.fields, [name]: value }
    });
  }

  addField(name: string, value: string = ''): void {
    this.setState({
      fields: { ...this.state.fields, [name]: value }
    });
  }
}

// Usage
const form = new Form({
  onSubmit: (data) => {
    console.log('Form submitted:', Object.fromEntries(data.entries()));
  }
});

form.addField('username');
form.addField('email');

document.body.appendChild(form.element);
```

**Advantages:**
- Reusability
- Maintainability
- Testability
- Clear component boundaries

**Disadvantages:**
- Can lead to deep component hierarchies
- State management complexity
- Performance overhead for large component trees

## Choosing the Right Architecture

### Factors to Consider

1. **Application Complexity**
   - Simple applications: MVC or basic component architecture
   - Complex business logic: Clean Architecture or DDD
   - Large scale: Microservices

2. **Team Size and Structure**
   - Small teams: Simpler architectures
   - Large teams: Microservices or modular architectures

3. **Performance Requirements**
   - High performance: Consider component-based or optimized MVC
   - Standard requirements: Most patterns work well

4. **Scalability Needs**
   - Horizontal scaling: Microservices
   - Vertical scaling: Most patterns work

5. **Development Speed**
   - Rapid prototyping: MVC or component-based
   - Long-term maintenance: Clean Architecture or DDD

### Migration Strategies

**From Monolithic to Microservices:**
1. Identify bounded contexts
2. Extract services gradually
3. Implement API gateway
4. Handle data migration
5. Update deployment pipeline

**From MVC to Clean Architecture:**
1. Identify core business logic
2. Create use case layer
3. Extract interfaces for external dependencies
4. Implement dependency injection
5. Gradually move existing code

**From Simple to Complex Architecture:**
1. Start with clear separation of concerns
2. Extract reusable components
3. Implement proper interfaces
4. Add layers as complexity grows
5. Maintain backward compatibility

## Best Practices

### 1. Consistency
- Choose one architecture and stick to it
- Establish coding standards for the chosen pattern
- Document architectural decisions

### 2. Testing
- Unit test business logic independently
- Integration test component interactions
- End-to-end test user workflows

### 3. Documentation
- Document architectural decisions and rationale
- Create diagrams showing component relationships
- Maintain API documentation

### 4. Evolution
- Design for change and extension
- Use dependency injection for flexibility
- Implement proper versioning for APIs

Remember: No single architecture fits all scenarios. Choose based on your specific requirements, team capabilities, and long-term goals. The key is to start simple and evolve the architecture as your application grows in complexity.