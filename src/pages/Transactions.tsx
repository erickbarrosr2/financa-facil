import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, useDeleteTransaction, useCategories, useAccounts, useTogglePaid } from "@/hooks/useFinanceData";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSearchParams } from "react-router-dom";

export default function Transactions() {
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const showToday = searchParams.get("today") === "1";

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
  const togglePaid = useTogglePaid();

  const todayStr = now.toISOString().split("T")[0];

  // Clear the ?today param after initial render so back nav doesn't re-trigger
  useEffect(() => {
    if (showToday) {
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToday, setSearchParams]);

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const handleTogglePaid = useCallback((id: string, currentVal: boolean) => {
    togglePaid.mutate({ id, is_paid: !currentVal });
  }, [togglePaid]);

  // Sort: if showToday, put today's transactions first
  const sortedTransactions = transactions ? [...transactions].sort((a, b) => {
    if (showToday) {
      const aToday = a.date === todayStr ? 0 : 1;
      const bToday = b.date === todayStr ? 0 : 1;
      if (aToday !== bToday) return aToday - bToday;
    }
    return 0;
  }) : [];

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterCategory("");
    setFilterAccount("");
  };

  const hasFilters = search || (filterType && filterType !== "all") || (filterCategory && filterCategory !== "all") || (filterAccount && filterAccount !== "all");

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
      {hasFilters && (
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
          <X className="w-3.5 h-3.5" /> Limpar filtros
        </Button>
      )}

      {/* Transaction list */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {sortedTransactions.map((tx) => {
            const isToday = tx.date === todayStr;
            const isPaid = (tx as any).is_paid === true;
            const isExpense = tx.type === "expense";
            const isIncome = tx.type === "income";

            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors ${showToday && isToday ? "bg-primary/5 dark:bg-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Payment checkbox for expenses */}
                  {isExpense && (
                    <Checkbox
                      checked={isPaid}
                      onCheckedChange={() => handleTogglePaid(tx.id, isPaid)}
                      aria-label={isPaid ? "Marcar como não paga" : "Marcar como paga"}
                      className="w-5 h-5 flex-shrink-0"
                    />
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-income-light" : "bg-expense-light"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="w-4 h-4 text-income" /> : <ArrowDownRight className="w-4 h-4 text-expense" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description || (tx.categories as any)?.name || "Transação"}
                      </p>
                      {isExpense && (
                        <Badge
                          variant={isPaid ? "default" : "destructive"}
                          className={`text-[10px] px-1.5 py-0 leading-4 flex-shrink-0 ${isPaid ? "bg-income/15 text-income hover:bg-income/20 border-0" : ""}`}
                          aria-label={isPaid ? "Status: Paga" : "Status: Não paga"}
                        >
                          {isPaid ? "Paga" : "Não paga"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(tx.categories as any)?.name} · {(tx.accounts as any)?.name} · {format(new Date(tx.date + "T12:00:00"), "dd/MM", { locale: ptBR })}
                    </p>
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
            );
          })}
          {(!transactions || transactions.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma transação encontrada</p>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} editData={editData} />
    </div>
  );
}
