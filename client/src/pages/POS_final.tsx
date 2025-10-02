import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, X } from 'lucide-react';
import { apiClient } from '../services';
import './POS.css';

interface MenuItem {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  selling_price: number;
  category_id: number;
  category_name?: string;
  availability: string;
  is_unlimited: boolean;
  quantity_in_stock: number;
  unit_type: string;
  image_url?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

const POS: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderNumber, setOrderNumber] = useState(1);
  const [subtotal, setSubtotal] = useState(398);
  const [serviceCharge] = useState(20);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(418);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();

    setCart([{
      id: 1,
      name: 'SET A UNLI PORK',
      price: 199,
      quantity: 2,
      total: 398
    }]);
  }, []);

  const calculateTotals = React.useCallback(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const newTotal = newSubtotal + serviceCharge - discount;
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [cart, serviceCharge, discount]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/inventory/items');
      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { 
              ...cartItem, 
              quantity: cartItem.quantity + 1,
              total: (cartItem.quantity + 1) * cartItem.price
            }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.selling_price,
        quantity: 1,
        total: item.selling_price
      }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const applyDiscount = (type: 'senior' | 'pwd' | 'leftover') => {
    switch (type) {
      case 'senior':
      case 'pwd':
        setDiscount(subtotal * 0.20);
        break;
      case 'leftover':
        setDiscount(25);
        break;
      default:
        setDiscount(0);
    }
  };

  const resetOrder = () => {
    setCart([]);
    setDiscount(0);
    setOrderNumber(prev => prev + 1);
  };

  const processPayment = () => {
    if (cart.length === 0) {
      alert('Please add items to cart before processing payment');
      return;
    }

    alert('Processing payment...');
    resetOrder();
  };

  // Suppress unused variable warnings for development features  
  if (false) {
    console.log({ menuItems, addToCart });
  }

  if (loading) {
    return (
      <div className="pos-loading">
        <div className="loading-spinner">Loading POS...</div>
      </div>
    );
  }

  return (
    <div className="pos-container">
      {}
      <div className="pos-header">
        <div className="logo-section">
          <h2>Admin POS</h2>
        </div>
        <div className="customer-section">
          <div className="customer-avatar">
            <User size={24} />
          </div>
          <div className="customer-info">
            <span className="customer-name">Reah</span>
            <span className="customer-role">Hipolito</span>
          </div>
        </div>
      </div>

      <div className="pos-main">
        {}
        <div className="menu-section">
          {}
          <div className="discount-section">
            <h3>Discounts</h3>
            <div className="discount-buttons">
              <button 
                className="discount-btn senior"
                onClick={() => applyDiscount('senior')}
              >
                SENIOR<br />DISCOUNT
              </button>
              <button 
                className="discount-btn pwd"
                onClick={() => applyDiscount('pwd')}
              >
                PWD<br />DISCOUNT
              </button>
            </div>

            <h3>Charge Fees</h3>
            <div className="charge-buttons">
              <button 
                className="charge-btn leftover"
                onClick={() => applyDiscount('leftover')}
              >
                LEFT OVERS<br />FEE
              </button>
            </div>
          </div>

          {}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {}
          <div className="category-section">
            <h3>Unlimited Menu</h3>
            <div className="category-buttons">
              <div className="category-row">
                <button className="category-btn active">
                  SET A<br />UNLI PORK
                </button>
                <button className="category-btn">
                  SET B<br />UNLI PORK<br />& CHICKEN
                </button>
                <button className="category-btn">
                  SET C<br />UNLI<br />PREMIUM PORK
                </button>
                <button className="category-btn">
                  SET D<br />UNLI PREMIUM PORK<br />& CHICKEN
                </button>
              </div>
            </div>

            <h3>Ala Carte Menu</h3>
            <div className="category-buttons">
              <div className="category-row">
                <button className="category-btn">
                  SAMG PORK<br />ON CUP
                </button>
                <button className="category-btn">
                  SAMG CHICKEN<br />ON CUP
                </button>
                <button className="category-btn">
                  SAMG BEEF<br />ON CUP
                </button>
                <button className="category-btn">
                  CHICKEN<br />POPPERS ON CUP
                </button>
              </div>
              <div className="category-row">
                <button className="category-btn">
                  KOREAN MEET<br />ON CUP
                </button>
                <button className="category-btn">
                  CHICKEN<br />POPPERS
                </button>
                <button className="category-btn">
                  CHEESE
                </button>
              </div>
            </div>

            <h3>Side Dishes</h3>
            <div className="category-buttons">
              <div className="category-row">
                <button className="category-btn">
                  CHEESE<br />ON TUB
                </button>
                <button className="category-btn">
                  FISHCAKE<br />ON TUB
                </button>
                <button className="category-btn">
                  EGGROLL<br />ON TUB
                </button>
                <button className="category-btn">
                  BABY POTATOES<br />ON TUB
                </button>
              </div>
              <div className="category-row">
                <button className="category-btn">
                  KIMCHI<br />ON TUB
                </button>
              </div>
            </div>

            <h3>Ad Ons</h3>
            <div className="category-buttons">
              <div className="category-row">
                <button className="category-btn">
                  UNLI CHEESE
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="cart-section">
          <div className="order-header">
            <h3>ORDER # {orderNumber.toString().padStart(4, '0')}</h3>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={48} />
                <p>No items in cart</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item cart-item-selected">
                  <div className="cart-item-text">
                    {item.name}
                    <span className="cart-item-quantity">{item.quantity}</span>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>SUBTOTAL:</span>
              <span>{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>SERVICE CHARGE:</span>
              <span>{serviceCharge}</span>
            </div>
            <div className="summary-row">
              <span>DISCOUNT:</span>
              <span>{discount}</span>
            </div>
            <div className="summary-row total">
              <span>TOTAL</span>
              <span>{total}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="save-btn">SAVE</button>
            <button className="payment-btn" onClick={processPayment}>
              PAYMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
