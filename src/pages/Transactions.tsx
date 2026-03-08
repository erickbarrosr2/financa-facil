import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, useDeleteTransaction, useCategories, useAccounts } from "@/hooks/useFinanceData";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [txOpen, setTxOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: transactions } = useTransactions({
    month, year, search: search || undefined,
    type: (filterType && filterType !== "all") ? filterType : undefined,
    categoryId: (filterCategory && filterCategory !== "all") ? filterCategory : undefined,
    accountId: (filterAccount && filterAccount !== "all") ? filterAccount : undefined,
  });
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const deleteTx = useDeleteTransaction();

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Transações</h1>
        <Button onClick={() => { setEditData(null); setTxOpen(true); }} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Nova
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {months.map((m, i) => (
          <Button
            key={m}
            variant={month === i ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => setMonth(i)}
          >
            {m}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAccount} onValueChange={setFilterAccount}>
          <SelectTrigger><SelectValue placeholder="Conta" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction list */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {transactions?.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-income-light" : "bg-expense-light"}`}>
                  {tx.type === "income" ? <ArrowUpRight className="w-4 h-4 text-income" /> : <ArrowDownRight className="w-4 h-4 text-expense" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description || (tx.categories as any)?.name || "Transação"}</p>
                  <p className="text-xs text-muted-foreground">{(tx.categories as any)?.name} · {(tx.accounts as any)?.name} · {format(new Date(tx.date + "T12:00:00"), "dd/MM", { locale: ptBR })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setEditData(tx); setTxOpen(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTx.mutate(tx.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {(!transactions || transactions.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma transação encontrada</p>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} editData={editData} />
    </div>
  );
}
