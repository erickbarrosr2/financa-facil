import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useFinanceData";
import { Plus, Pencil, Trash2, Wallet, CreditCard, PiggyBank, Banknote } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const accountTypes = [
  { value: "checking", label: "Conta Corrente", icon: Wallet },
  { value: "wallet", label: "Carteira", icon: Banknote },
  { value: "credit", label: "Cartão de Crédito", icon: CreditCard },
  { value: "investment", label: "Investimento", icon: PiggyBank },
];

export default function Accounts() {
  const { data: accounts } = useAccounts();
  const createAcc = useCreateAccount();
  const updateAcc = useUpdateAccount();
  const deleteAcc = useDeleteAccount();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState("");

  const openEdit = (acc: any) => {
    setEditData(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(String(acc.initial_balance));
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditData(null);
    setName("");
    setType("checking");
    setBalance("0");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, type, initial_balance: parseFloat(balance) || 0 };
    if (editData) {
      updateAcc.mutate({ id: editData.id, ...data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createAcc.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const getIcon = (t: string) => {
    const found = accountTypes.find((at) => at.value === t);
    return found ? found.icon : Wallet;
  };

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Contas</h1>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Nova conta</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((acc) => {
          const Icon = getIcon(acc.type);
          return (
            <Card key={acc.id} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{accountTypes.find((t) => t.value === acc.type)?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(acc)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                          <AlertDialogDescription>Todas as transações desta conta serão excluídas.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAcc.mutate(acc.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-xl font-bold mt-4 text-foreground">{formatCurrency(acc.initial_balance)}</p>
                <p className="text-xs text-muted-foreground">Saldo inicial</p>
              </CardContent>
            </Card>
          );
        })}
        {(!accounts || accounts.length === 0) && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-12">Crie sua primeira conta para começar</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editData ? "Editar conta" : "Nova conta"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Banco do Brasil" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Saldo inicial (R$)</Label>
              <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">{editData ? "Salvar" : "Criar conta"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
