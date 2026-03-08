import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useAccounts, useCreateTransaction, useUpdateTransaction } from "@/hooks/useFinanceData";
import { Textarea } from "@/components/ui/textarea";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
}

export function TransactionDialog({ open, onOpenChange, editData }: TransactionDialogProps) {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amountRaw, setAmountRaw] = useState(0); // value in cents
  const [amountDisplay, setAmountDisplay] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const cents = parseInt(raw || "0", 10);
    setAmountRaw(cents);
    setAmountDisplay(formatCurrency(cents));
  };

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(String(editData.amount));
      setCategoryId(editData.category_id || "");
      setAccountId(editData.account_id);
      setDate(editData.date);
      setDescription(editData.description || "");
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setAccountId(accounts?.[0]?.id || "");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
    }
  }, [editData, open, accounts]);

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type,
      amount: parseFloat(amount),
      category_id: categoryId || null,
      account_id: accountId,
      date,
      description: description || null,
    };

    if (editData) {
      updateTx.mutate({ id: editData.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTx.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={type === "expense" ? "flex-1 bg-expense hover:bg-expense/90" : "flex-1"}
              onClick={() => setType("expense")}
            >
              Despesa
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={type === "income" ? "flex-1 bg-income hover:bg-income/90" : "flex-1"}
              onClick={() => setType("income")}
            >
              Receita
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="text-2xl font-bold h-14"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {accounts?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Almoço no restaurante" rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={createTx.isPending || updateTx.isPending}>
            {editData ? "Salvar alterações" : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
