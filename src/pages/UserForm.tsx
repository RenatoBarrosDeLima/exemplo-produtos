import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { fetchUser, createUser, updateUser } from '../api/users';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
  color: '#1e293b', boxSizing: 'border-box',
};

function Field({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

// Masks
function maskCpf(v: string) {
  return v.replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'cpf' | 'phone', string>>;

export function UserForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    fetchUser(Number(id))
      .then(u => {
        setName(u.name);
        setEmail(u.email);
        setCpf(u.cpf ?? '');
        setPhone(u.phone ?? '');
      })
      .catch(() => setApiError('Usuário não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!name.trim()) errors.name = 'Nome é obrigatório';
    if (!email.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail inválido';
    if (!isEdit && !password.trim()) errors.password = 'Senha é obrigatória';
    else if (password && password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (!cpf.trim()) errors.cpf = 'CPF é obrigatório';
    else if (cpf.replace(/\D/g, '').length < 11) errors.cpf = 'CPF inválido';
    if (!phone.trim()) errors.phone = 'Telefone é obrigatório';
    else if (phone.replace(/\D/g, '').length < 10) errors.phone = 'Telefone inválido';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const base = { name: name.trim(), email: email.trim(), cpf, phone };
      if (isEdit) {
        const payload = password ? { ...base, password } : base;
        await updateUser(Number(id), payload);
      } else {
        await createUser({ ...base, password });
      }
      navigate('/users');
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          Carregando…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/users')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b' }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEdit ? 'Editar usuário' : 'Novo usuário'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '32px auto', padding: '0 32px', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '28px 32px' }}>

          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
              ⚠️ {apiError}
            </div>
          )}

          <Field label="Nome completo" required error={fieldErrors.name}>
            <input
              style={{ ...inp, borderColor: fieldErrors.name ? '#fca5a5' : '#e2e8f0' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </Field>

          <Field label="E-mail" required error={fieldErrors.email}>
            <input
              style={{ ...inp, borderColor: fieldErrors.email ? '#fca5a5' : '#e2e8f0' }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="joao@empresa.com"
            />
          </Field>

          <Field
            label={isEdit ? 'Nova senha' : 'Senha'}
            required={!isEdit}
            error={fieldErrors.password}
          >
            <input
              style={{ ...inp, borderColor: fieldErrors.password ? '#fca5a5' : '#e2e8f0' }}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isEdit ? '' : 'Mínimo 6 caracteres'}
              autoComplete="new-password"
            />
          </Field>

          {/* CPF + Telefone lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="CPF" required error={fieldErrors.cpf}>
              <input
                style={{ ...inp, borderColor: fieldErrors.cpf ? '#fca5a5' : '#e2e8f0' }}
                value={cpf}
                onChange={e => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </Field>

            <Field label="Telefone" required error={fieldErrors.phone}>
              <input
                style={{ ...inp, borderColor: fieldErrors.phone ? '#fca5a5' : '#e2e8f0' }}
                value={phone}
                onChange={e => setPhone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
              />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => navigate('/users')}
              style={{ padding: '9px 20px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#64748b' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '9px 28px', background: saving ? '#818cf8' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'default' : 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
