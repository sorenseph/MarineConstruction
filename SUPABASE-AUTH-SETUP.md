# Configuración de Login (Supabase Auth)

Los usuarios se **crean automáticamente** en el primer login. No necesitas crearlos manualmente.

## Configuración requerida en Supabase

1. **Authentication** → **Providers** → **Email**: Desactiva **"Confirm email"** para que el primer login funcione sin confirmar correo.

## Credenciales

| Usuario | Contraseña | Notas |
|---------|------------|-------|
| **rubenconstruction** | **admin6976** | Usuario principal |
| israelcardenas | webie3899 | |
| jadeadmin | cadena19 | |

**Nota importante:** El login usa el **nombre de usuario** (ej: `rubenconstruction`), NO el email. Si no puedes iniciar sesión:
- Verifica que escribas `rubenconstruction` en el campo de usuario
- Contraseña: `admin6976`
- Si el error persiste, revisa en Supabase Dashboard → Authentication → Users si el usuario existe y considera restablecer la contraseña desde ahí.

En el primer inicio de sesión, si el usuario no existe, se crea automáticamente.

## Emails usados internamente

- rubenconstruction@rubensconstruction.com
- israelcardenas@rubensconstruction.com
- jadeadmin@rubensconstruction.com
