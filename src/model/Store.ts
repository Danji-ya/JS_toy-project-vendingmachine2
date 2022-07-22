/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { COIN_LIST, ERROR_MESSAGE, SELECTOR } from '../constants';
import { Product, VendingMachine } from '../types/vendingMachine';
import {
  isValidAmount,
  isValidProduct,
  removeFirstLetter,
  isEnoughAmount,
} from '../utils';
import { entries } from '../utils/common';
import { getRandomNumber } from '../utils/randomCoinMaker';
import { getCoinsSum } from '../view/VendingMachineManageView/Template';

function descendingOrder(arr: Array<[number, number]>) {
  return arr.sort((a, b) => b[0] - a[0]);
}

class Store {
  selectedTab: string;

  vendingMachine: VendingMachine;

  constructor() {
    this.selectedTab = removeFirstLetter(SELECTOR.TAB_MENU.PRODUCT_ADD); // 처음 시작할 탭
    this.vendingMachine = {
      inputAmount: 0,
      coins: { 500: 0, 100: 0, 50: 0, 10: 0 },
      products: [{ name: 'test', price: 5000, quantity: 5 }],
      changeCoins: { 500: 0, 100: 0, 50: 0, 10: 0 },
    };
  }

  setSelectedTab(tab: string) {
    this.selectedTab = tab;
  }

  addProduct(product: Partial<Product>) {
    if (!isValidProduct(product, this.vendingMachine.products)) return false;

    this.vendingMachine.products = [
      product as Product,
      ...this.vendingMachine.products,
    ];

    return true;
  }

  addCoins(amount?: number) {
    if (!isValidAmount(amount)) return false;

    let insertedAmount = amount as number;

    while (insertedAmount > 0) {
      const randomCoin = getRandomNumber(COIN_LIST);
      if (!isEnoughAmount(insertedAmount, randomCoin)) continue;

      this.vendingMachine.coins[randomCoin] += 1;
      insertedAmount -= randomCoin;
    }

    return true;
  }

  inputMoney(amount?: number) {
    if (!isValidAmount(amount)) return false;

    this.vendingMachine.inputAmount += amount as number;

    return true;
  }

  productPurchase(product: Pick<Product, 'name' | 'price'>) {
    const { name, price } = product;

    if (!isEnoughAmount(this.vendingMachine.inputAmount, price)) {
      alert(ERROR_MESSAGE.PRODUCT_PURCHASE_ERROR);
      return false;
    }

    const newVendingMachine = {
      inputAmount: (this.vendingMachine.inputAmount -= price),
      products: this.vendingMachine.products.map((oldProduct) => {
        if (oldProduct.name === name) {
          oldProduct.quantity -= 1;
        }

        return oldProduct;
      }),
    };

    this.vendingMachine = {
      ...this.vendingMachine,
      ...newVendingMachine,
    };

    return true;
  }

  returnChange() {
    const coinsSum = getCoinsSum(this.vendingMachine.coins);
    const { inputAmount } = this.vendingMachine;

    if (inputAmount > coinsSum) {
      this.returnPartOfChange();
    } else {
      this.returnAllOfChange();
    }

    return true;
  }

  returnPartOfChange() {
    let { inputAmount } = this.vendingMachine;
    const newCoins = { ...this.vendingMachine.coins };
    const newchangeCoins = { ...this.vendingMachine.changeCoins };

    for (const [unit, count] of descendingOrder(
      entries(this.vendingMachine.coins),
    )) {
      const coinUnit = unit;

      newCoins[coinUnit] = 0;
      newchangeCoins[coinUnit] += count;
      inputAmount -= coinUnit * count;
    }

    this.setVendingMachine({
      inputAmount,
      coins: newCoins,
      changeCoins: newchangeCoins,
    });
  }

  returnAllOfChange() {
    let { inputAmount } = this.vendingMachine;
    const newCoins = { ...this.vendingMachine.coins };
    const newchangeCoins = { ...this.vendingMachine.changeCoins };

    for (const [unit, count] of descendingOrder(
      entries(this.vendingMachine.coins),
    )) {
      if (inputAmount === 0) break;

      const coinUnit = unit;
      const needCount = Math.floor(inputAmount / coinUnit);
      const amount = Math.min(count, needCount);

      newCoins[coinUnit] = count - amount;
      newchangeCoins[coinUnit] += amount;
      inputAmount -= coinUnit * amount;
    }

    this.setVendingMachine({
      inputAmount,
      coins: newCoins,
      changeCoins: newchangeCoins,
    });
  }

  getProducts() {
    return this.vendingMachine.products;
  }

  getVendingMachine() {
    return this.vendingMachine;
  }

  setVendingMachine(partOfVendingMachine: Partial<VendingMachine>) {
    this.vendingMachine = {
      ...this.vendingMachine,
      ...partOfVendingMachine,
    };
  }
}

export default Store;
