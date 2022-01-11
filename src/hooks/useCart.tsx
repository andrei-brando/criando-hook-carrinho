import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // procurar no local storage p/ ver se tem algum, se não tiver, eu adiciono ao carrinho normalmente
      // se tiver, eu preciso achar o index dele no objeto CART, criar um novo objeto CART e substituir ele
      // com uma quantidade a mais

      const findProductIndex = cart.findIndex(
        (product) => product.id === productId
      );

      const { data: product } = await api.get(`/products/${productId}`);

      if (findProductIndex < 0) {
        product.amount = 1;
        setCart([...cart, product]);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
        return;
      }

      const newCart = cart.slice();
      newCart[findProductIndex].amount = ++newCart[findProductIndex].amount;

      const isAvailable = await checkAvailableQuantity(
        productId,
        newCart[findProductIndex].amount
      );

      if (!isAvailable) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      setCart([...newCart]);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const index = cart.findIndex((product) => product.id === productId);
      const newCart = cart;
      newCart.splice(index, 1);
      setCart([...newCart]);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const checkAvailableQuantity = async (
    productId: number,
    newQuantity: number
  ): Promise<boolean> => {
    const { data: stock } = await api.get(`/stock/${productId}`);
    if ((stock as UpdateProductAmount).amount < newQuantity) return false;
    return true;
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const index = cart.findIndex((product) => product.id === productId);
      const newCart = cart;

      newCart[index].amount += 1 * amount;

      const isAvailable = await checkAvailableQuantity(
        productId,
        newCart[index].amount
      );

      if (!isAvailable) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      console.log(newCart);

      setCart([...newCart]);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
