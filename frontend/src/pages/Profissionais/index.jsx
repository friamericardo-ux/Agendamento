import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import ProfissionalForm from "./ProfissionalForm";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProfissionais = async () => {
    try {
      const { data } = await api.get("/profissionais/");
      setProfissionais(data);
    } catch {
      toast.error("Erro ao carregar profissionais");
    }
  };

  useEffect(() => {
    fetchProfissionais();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    try {
      await api.delete(`/profissionais/${id}`);
      toast.success("Profissional excluído com sucesso");
      fetchProfissionais();
    } catch {
      toast.error("Erro ao excluir profissional");
    }
  };

  const openEdit = (profissional) => {
    setEditing(profissional);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profissionais</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Novo Profissional
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Especialidade</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">WhatsApp</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profissionais.map((prof) => (
              <tr key={prof.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{prof.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{prof.especialidade || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{prof.whatsapp || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      prof.ativo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {prof.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(prof)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(prof.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {profissionais.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum profissional cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProfissionalForm
          profissional={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setModalOpen(false);
            setEditing(null);
            fetchProfissionais();
          }}
        />
      )}
    </div>
  );
}
