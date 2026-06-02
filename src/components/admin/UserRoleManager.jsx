import { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import { authService } from '../../services/auth.service';

const roleOptions = [
  { value: 'buyer', label: 'Usuario' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'admin', label: 'Admin' }
];

const roleStyles = {
  buyer: 'bg-gray-100 text-gray-700',
  seller: 'bg-green-100 text-green-700',
  admin: 'bg-primary/10 text-primary'
};

const UserRoleManager = ({ currentUserId, onCurrentUserRoleChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await authService.listUsers();

      if (error) {
        setErrorMessage('No se pudieron cargar los usuarios: ' + error.message);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (loadError) {
      setErrorMessage('No se pudieron cargar los usuarios: ' + loadError.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  const handleRoleChange = async (targetUser, role) => {
    if (targetUser.role === role) return;

    setSavingUserId(targetUser.id);

    try {
      const { data, error } = await authService.updateUserRole(targetUser.id, role);

      if (error) {
        alert('Error al cambiar el rol: ' + error.message);
        return;
      }

      const updatedUser = data || { ...targetUser, role };
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === targetUser.id ? { ...user, role: updatedUser.role } : user
        )
      );

      if (targetUser.id === currentUserId) {
        await onCurrentUserRoleChange?.();
      }
    } catch (saveError) {
      alert('Error al cambiar el rol: ' + saveError.message);
    } finally {
      setSavingUserId(null);
    }
  };

  const userList = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
            <UserCog className="text-primary" />
            Roles de usuarios
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Cambia un usuario entre usuario, vendedor y admin para probar los flujos de la plataforma.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : errorMessage ? (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl p-4 text-sm">
          {errorMessage}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Usuario</th>
                <th className="text-left font-semibold px-4 py-3">Rol actual</th>
                <th className="text-left font-semibold px-4 py-3">Cambiar rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {userList.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-dark">
                      {user.full_name || 'Usuario sin nombre'}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs font-bold text-primary">(tú)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${roleStyles[user.role] || roleStyles.buyer}`}>
                      {user.role === 'admin' && <ShieldCheck size={13} />}
                      {roleOptions.find((role) => role.value === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role || 'buyer'}
                      disabled={savingUserId === user.id}
                      onChange={(event) => handleRoleChange(user, event.target.value)}
                      className="w-full md:w-44 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserRoleManager;
