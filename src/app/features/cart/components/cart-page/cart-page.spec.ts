import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartPage } from './cart-page';
import { Product } from '../../../products/product';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;
  let router: Partial<Router>;

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    description: 'Test Description',
    price: 100,
    category: 'Test Category',
    image: 'https://example.com/image.jpg',
    rating: {
      rate: 4.5,
      count: 100,
    },
  };

  beforeEach(async () => {
    router = {
      navigate: vi.fn(),
    };

    const routeSnapshot = {
      paramMap: { get: () => null },
      url: [],
      firstChild: null,
    };

    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: routeSnapshot } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty cart items initially', () => {
    expect(component.cartItems).toEqual([]);
  });

  it('should have subtotal of 0 initially', () => {
    expect(component.subtotal).toBe(0);
  });

  it('should have shipping of 5.99', () => {
    expect(component.shipping).toBe(5.99);
  });

  it('should load cart from localStorage', () => {
    const savedCart = [{ product: mockProduct, quantity: 2 }];
    localStorage.setItem('shoppingCart', JSON.stringify(savedCart));
    component.loadCart();
    expect(component.cartItems).toHaveLength(1);
    expect(component.cartItems[0].product.title).toBe('Test Product');
  });

  it('should save cart to localStorage', () => {
    component.cartItems = [{ product: mockProduct, quantity: 2 }];
    component.saveCart();
    const saved = localStorage.getItem('shoppingCart');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved || '[]');
    expect(parsed).toHaveLength(1);
  });

  it('should update quantity', () => {
    component.cartItems = [{ product: mockProduct, quantity: 1 }];
    component.updateQuantity(component.cartItems[0], 3);
    expect(component.cartItems[0].quantity).toBe(3);
  });

  it('should remove item when quantity is 0 or less', () => {
    component.cartItems = [{ product: mockProduct, quantity: 1 }];
    component.updateQuantity(component.cartItems[0], 0);
    expect(component.cartItems).toHaveLength(0);
  });

  it('should remove item', () => {
    component.cartItems = [{ product: mockProduct, quantity: 1 }];
    component.removeItem(component.cartItems[0]);
    expect(component.cartItems).toHaveLength(0);
  });

  it('should calculate totals correctly', () => {
    component.cartItems = [
      { product: { ...mockProduct, price: 100 }, quantity: 2 },
      { product: { ...mockProduct, id: 2, price: 50 }, quantity: 1 },
    ];
    component.calculateTotals();
    expect(component.subtotal).toBe(250);
    expect(component.total).toBe(255.99);
  });

  it('should checkout with cart items', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.cartItems = [{ product: mockProduct, quantity: 1 }];
    component.checkout();
    expect(alertSpy).toHaveBeenCalledWith('Checkout functionality would be implemented here!');
    expect(component.cartItems).toHaveLength(0);
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    alertSpy.mockRestore();
  });

  it('should not checkout when cart is empty', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.checkout();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should save cart on destroy', () => {
    component.cartItems = [{ product: mockProduct, quantity: 1 }];
    component.ngOnDestroy();
    const saved = localStorage.getItem('shoppingCart');
    expect(saved).toBeTruthy();
  });

  it('should calculate totals on save', () => {
    component.cartItems = [{ product: { ...mockProduct, price: 100 }, quantity: 2 }];
    component.saveCart();
    expect(component.subtotal).toBe(200);
  });

  it('should calculate totals on load', () => {
    const savedCart = [{ product: { ...mockProduct, price: 100 }, quantity: 2 }];
    localStorage.setItem('shoppingCart', JSON.stringify(savedCart));
    component.loadCart();
    expect(component.subtotal).toBe(200);
  });

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('shoppingCart', 'invalid json');
    expect(() => component.loadCart()).toThrow();
  });
});
