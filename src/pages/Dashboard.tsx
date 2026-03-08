import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions, useAccounts } from "@/hooks/useFinanceData";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

const CHART_COLORS = [
  "hsl(160, 84%, 39%)", "hsl(200, 70%, 50%)", "hsl(280, 60%, 55%)",
  "hsl(40, 90%, 55%)", "hsl(0, 72%, 51%)", "hsl(320, 60%, 50%)",
];

export default function Dashboard() {
  const [txOpen, setTxOpen] = useState(false);
  const { user } = useAuth();
  const now = new Date();
  const { data: transactions } = useTransactions({ month: now.getMonth(), year: now.getFullYear() });
  const { data: accounts } = useAccounts();
  const userName = user?.user_metadata?.name || "Usuário";

  const income = transactions?.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0;
  const expense = transactions?.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0;

  const totalBalance = accounts?.reduce((sum, a) => {
    const accTxs = transactions?.filter((t) => t.account_id === a.id) ?? [];
    const accIncome = accTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const accExpense = accTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return sum + a.initial_balance + accIncome - accExpense;
  }, 0) ?? 0;

  const categoryData = transactions
    ?.filter((t) => t.type === "expense" && t.categories)
    .reduce((acc, t) => {
      const name = (t.categories as any)?.name ?? "Sem categoria";
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData ?? {}).map(([name, value]) => ({ name, value }));

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá, {userName}! 👋</h1>
          <p className="text-muted-foreground text-sm">{format(now, "MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        <Button onClick={() => setTxOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Nova transação
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo total</p>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? "text-income" : "text-expense"}`}>{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(income)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-income-light flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(expense)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-expense-light flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-expense" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pieData.length > 0 && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Gastos por categoria</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Últimas movimentações</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions?.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-income-light" : "bg-expense-light"}`}>
                      {tx.type === "income" ? <ArrowUpRight className="w-4 h-4 text-income" /> : <ArrowDownRight className="w-4 h-4 text-expense" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{(tx.categories as any)?.name ?? tx.description ?? "Transação"}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.date + "T12:00:00"), "dd MMM", { locale: ptBR })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação este mês</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} />
    </div>
  );
}
