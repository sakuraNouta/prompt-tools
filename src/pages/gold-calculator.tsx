import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useState, useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

interface Transaction {
  id: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  quantity: number;
  timestamp?: number;
  date: string;
  profit?: number;
  profitPercentage?: number;
}

export default function GoldCalculatorPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    id: Date.now().toString(), // 添加id字段
    type: "buy" as const,
    price: 0,
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem("goldTransactions");
    const savedCurrentPrice = localStorage.getItem("goldCurrentPrice");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedCurrentPrice) {
      setCurrentPrice(parseFloat(savedCurrentPrice));
    }
  }, []);

  const handleTransactionChange = (
    field: keyof typeof newTransaction,
    value: string
  ) => {
    const numValue = field === "date" ? value : parseFloat(value) || 0;
    setNewTransaction((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const calculateSellProfit = (
    price: number,
    quantity: number,
    transactions: Transaction[]
  ) => {
    let totalQuantity = 0;
    let totalCost = 0;

    for (const t of transactions) {
      if (t.type === "buy") {
        totalQuantity += t.quantity || 0;
        totalCost += t.amount;
      } else {
        totalQuantity -= t.quantity || 0;
        totalCost -=
          (totalCost / (totalQuantity + (t.quantity || 0))) * (t.quantity || 0);
      }
    }

    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    const sellAmount = price * quantity;
    const costAmount = averageCost * quantity;
    const profit = sellAmount - costAmount;
    const profitPercentage = costAmount > 0 ? (profit / costAmount) * 100 : 0;

    return { profit, profitPercentage };
  };

  const addTransaction = () => {
    // 检查数值字段
    if (
      !newTransaction.price ||
      !newTransaction.amount ||
      newTransaction.price <= 0 ||
      newTransaction.amount <= 0
    )
      return;

    const quantity = newTransaction.amount / newTransaction.price;
    let profit = 0;
    let profitPercentage = 0;

    if (newTransaction.type === "sell") {
      const profitInfo = calculateSellProfit(
        newTransaction.price,
        quantity,
        transactions
      );
      profit = profitInfo.profit;
      profitPercentage = profitInfo.profitPercentage;
    }

    const transaction: Transaction = {
      id: editingId || Date.now().toString(),
      type: newTransaction.type!, // 使用非空断言，因为我们已经确保type存在
      price: newTransaction.price!,
      amount: newTransaction.amount!,
      quantity: quantity,
      timestamp: Date.now(),
      date: newTransaction.date!,
      profit,
      profitPercentage,
    };

    // 根据是否在编辑模式计算新的交易列表
    const newTransactions = editingId
      ? transactions.map((t) => (t.id === editingId ? transaction : t))
      : [...transactions, transaction];

    // 更新交易列表和重置编辑状态
    setTransactions(newTransactions);
    setEditingId(null);

    // 保存交易列表到本地存储
    localStorage.setItem("goldTransactions", JSON.stringify(newTransactions));

    setNewTransaction({
      id: "0",
      type: "buy",
      price: 0,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const editTransaction = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setNewTransaction({
      type: transaction.type,
      price: transaction.price,
      amount: transaction.amount,
      date: transaction.date,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const calculatePosition = () => {
    let totalQuantity = 0;
    let totalCost = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "buy") {
        totalQuantity += transaction.quantity;
        totalCost += transaction.amount;
      } else {
        totalQuantity -= transaction.quantity;
        totalCost -=
          (totalCost / (totalQuantity + transaction.quantity)) *
          transaction.quantity;
      }
    });

    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    const currentValue = totalQuantity * currentPrice;
    const profit = currentValue - totalCost;
    const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      totalQuantity: totalQuantity.toFixed(4),
      totalCost: totalCost.toFixed(2),
      averageCost: averageCost.toFixed(2),
      currentValue: currentValue.toFixed(2),
      profit: profit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
    };
  };

  const results = calculatePosition();

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title({ color: "violet" })}>黄金计算器</h1>
        <p className="text-default-500 mt-4">计算黄金持仓成本和盈利</p>
        <Card className="max-w-4xl w-full">
          <CardHeader className="flex gap-3"></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-default-100 p-4 rounded-lg">
                <Select
                  label="交易类型"
                  selectedKeys={
                    newTransaction.type
                      ? new Set([newTransaction.type])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0]?.toString() || "buy";
                    handleTransactionChange("type", value);
                  }}
                >
                  <SelectItem key="buy">买入</SelectItem>
                  <SelectItem key="sell">卖出</SelectItem>
                </Select>
                <Input
                  type="number"
                  label="单价"
                  placeholder="请输入单价"
                  value={newTransaction.price?.toString()}
                  onChange={(e) =>
                    handleTransactionChange("price", e.target.value)
                  }
                  endContent={
                    <div className="pointer-events-none text-nowrap">元/克</div>
                  }
                />
                <Input
                  type="number"
                  label="金额"
                  placeholder="请输入金额"
                  value={newTransaction.amount?.toString()}
                  onChange={(e) =>
                    handleTransactionChange("amount", e.target.value)
                  }
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="date"
                  label="交易日期"
                  value={newTransaction.date}
                  onChange={(e) =>
                    handleTransactionChange("date", e.target.value)
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button
                    color="default"
                    onPress={() => {
                      setEditingId(null);
                      setNewTransaction({
                        id: "0",
                        type: "buy",
                        price: 0,
                        amount: 0,
                        date: new Date().toISOString().split("T")[0],
                      });
                    }}
                  >
                    取消
                  </Button>
                )}
                <Button color="primary" onPress={addTransaction}>
                  {editingId ? "保存修改" : "添加交易"}
                </Button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4">交易记录</h3>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-4 bg-default-100 rounded-lg hover:bg-default-200 transition-colors"
                    >
                      <div className="space-x-4">
                        <span
                          className={`font-semibold px-2 py-1 rounded ${transaction.type === "buy" ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"}`}
                        >
                          {transaction.type === "buy" ? "买入" : "卖出"}
                        </span>
                        <span>{transaction.price}元/克</span>
                        <span>{transaction.amount}元</span>
                        <span>{(transaction.quantity || 0).toFixed(4)}克</span>
                        <span>{transaction.date}</span>
                        {transaction.type === "sell" &&
                          transaction.profit !== undefined && (
                            <>
                              <span
                                className={`font-semibold ${transaction.profit >= 0 ? "text-success-600" : "text-danger-600"}`}
                              >
                                {transaction.profit >= 0 ? "+" : ""}
                                {transaction.profit.toFixed(2)}元
                              </span>
                              <span
                                className={`font-semibold ${transaction.profit >= 0 ? "text-success-600" : "text-danger-600"}`}
                              >
                                ({transaction.profit >= 0 ? "+" : ""}
                                {transaction.profitPercentage?.toFixed(2)}%)
                              </span>
                            </>
                          )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="default"
                          variant="flat"
                          onPress={() => editTransaction(transaction)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => deleteTransaction(transaction.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 bg-default-100 p-4 rounded-lg">
                <Input
                  type="number"
                  label="当前价格"
                  placeholder="请输入当前价格"
                  value={currentPrice.toString()}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setCurrentPrice(price);
                    localStorage.setItem("goldCurrentPrice", price.toString());
                  }}
                  endContent={
                    <div className="pointer-events-none text-nowrap">元/克</div>
                  }
                />

                <div className="mt-4 space-y-3 bg-default-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>当前持仓：</span>
                    <span className="font-semibold">
                      {results.totalQuantity} 克
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>总成本：</span>
                    <span className="font-semibold">
                      {results.totalCost} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均成本：</span>
                    <span className="font-semibold">
                      {results.averageCost} 元/克
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>当前市值：</span>
                    <span className="font-semibold">
                      {results.currentValue} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>盈亏：</span>
                    <span
                      className={`font-semibold ${Number(results.profit) >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {results.profit} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>盈亏比例：</span>
                    <span
                      className={`font-semibold ${Number(results.profitPercentage) >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {results.profitPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
