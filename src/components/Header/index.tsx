import React from "react";
import { Link } from "react-router-dom";
import { MdShoppingBasket } from "react-icons/md";

import logo from "../../assets/images/logo.svg";
import { Container, Cart } from "./styles";
import { useCart } from "../../hooks/useCart";

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const cartSize = calcCartSize();

  function calcCartSize(): number {
    const calc = cart.reduce(
      (acc, product) => {
        if (!acc.ids.find((id) => id === product.id)) {
          ++acc.size;
          acc.ids.push(product.id);
        }

        return acc;
      },
      {
        size: 0,
        ids: Array.of<number>(),
      }
    );

    return calc.size;
  }

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
