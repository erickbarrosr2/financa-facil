import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useFinanceData";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Categories() {
  const { data: categories } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");

  const openNew = () => { setEditData(null); setName(""); setType("expense"); setDialogOpen(true); };
  const openEdit = (cat: any) => { setEditData(cat); setName(cat.name); setType(cat.type); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editData) {
      updateCat.mutate({ id: editData.id, name, type }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createCat.mutate({ name, type }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const expenseCategories = categories?.filter((c) => c.type === "expense") || [];
  const incomeCategories = categories?.filter((c) => c.type === "income") || [];

  const renderList = (list: typeof categories) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {list?.map((cat) => (
        <Card key={cat.id} className="glass-card">
          <CardContent className="py-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.type === "income" ? "bg-income-light" : "bg-expense-light"}`}>
                <Tag className={`w-4 h-4 ${cat.type === "income" ? "text-income" : "text-expense"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{cat.name}</p>
                {cat.is_default && <p className="text-xs text-muted-foreground">Padrão</p>}
              </div>
            </div>
            {!cat.is_default && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(cat)}><Pencil className="w-3 h-3" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                      <AlertDialogDescription>Transações com esta categoria ficarão sem categoria.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCat.mutate(cat.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Nova</Button>
      </div>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Despesas ({expenseCategories.length})</TabsTrigger>
          <TabsTrigger value="income">Receitas ({incomeCategories.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="expense" className="mt-4">{renderList(expenseCategories)}</TabsContent>
        <TabsContent value="income" className="mt-4">{renderList(incomeCategories)}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editData ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">{editData ? "Salvar" : "Criar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
