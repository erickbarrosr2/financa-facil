import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions, useCategories } from "@/hooks/useFinanceData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COLORS = [
  "hsl(160, 84%, 39%)", "hsl(200, 70%, 50%)", "hsl(280, 60%, 55%)",
  "hsl(40, 90%, 55%)", "hsl(0, 72%, 51%)", "hsl(320, 60%, 50%)",
];

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Fetch all 12 months for the year
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return months.map((name, i) => ({ name, month: i }));
  }, []);

  // We need all transactions for the year - fetch without month filter
  const { data: yearTransactions } = useTransactions({
    month: undefined as any,
    year: undefined as any,
  });

  const filteredYearTx = useMemo(() => {
    return yearTransactions?.filter((t) => {
      const d = new Date(t.date + "T12:00:00");
      return d.getFullYear() === year;
    }) || [];
  }, [yearTransactions, year]);

  const barData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return months.map((name, i) => {
      const monthTxs = filteredYearTx.filter((t) => new Date(t.date + "T12:00:00").getMonth() === i);
      const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { name, income, expense };
    });
  }, [filteredYearTx]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredYearTx.filter((t) => t.type === "expense").forEach((t) => {
      const name = (t.categories as any)?.name ?? "Sem categoria";
      map[name] = (map[name] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredYearTx]);

  const totalIncome = filteredYearTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredYearTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-semibold text-foreground min-w-[3rem] text-center">{year}</span>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total receitas</p>
            <p className="text-xl font-bold text-income">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total despesas</p>
            <p className="text-xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Evolução mensal</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" stroke="currentColor" style={{ stroke: 'hsl(var(--border))' }} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="income" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {categoryData.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Despesas por categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-foreground">{d.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
