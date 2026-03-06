import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
        if (data) setName(data.name);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado!");
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
