import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  CreateInstitutionModal,
  EditInstitutionModal,
} from '../components/institutions'
import { Button } from '../components/ui/button'
import {
  type Institution,
  deleteInstitution,
  fetchInstitutions,
  patchInstitutionActive,
} from '../lib/institutionsApi'
import { showToast } from '../lib/toast'

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return fallback
}

function isInstitutionActive(inst: Institution): boolean {
  return inst.isActive !== false
}

export function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)

  const loadInstitutions = useCallback(async () => {
    setLoadingList(true)
    try {
      const list = await fetchInstitutions()
      setInstitutions(list)
    } catch (err) {
      showToast.error(
        getErrorMessage(err, 'Não foi possível carregar as instituições.'),
      )
      setInstitutions([])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void loadInstitutions()
  }, [loadInstitutions])

  const handleEdit = (inst: Institution) => {
    setSelectedInstitution(inst)
    setEditOpen(true)
  }

  const handleCloseEdit = () => {
    setEditOpen(false)
    setSelectedInstitution(null)
  }

  const handleDelete = async (inst: Institution) => {
    const ok = window.confirm(
      `Excluir "${inst.name}"? Esta ação não pode ser anulada.`,
    )
    if (!ok) return

    setPendingDeleteId(inst.id)
    try {
      await deleteInstitution(inst.id)
      showToast.success('Instituição excluída com sucesso.')
      setInstitutions((prev) => prev.filter((i) => i.id !== inst.id))
    } catch (err) {
      showToast.error(getErrorMessage(err, 'Não foi possível excluir a instituição.'))
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleToggleActive = async (inst: Institution) => {
    const next = !isInstitutionActive(inst)
    setPendingToggleId(inst.id)
    try {
      await patchInstitutionActive(inst.id, next)
      showToast.success(next ? 'Instituição ativada.' : 'Instituição desativada.')
      setInstitutions((prev) =>
        prev.map((i) => (i.id === inst.id ? { ...i, isActive: next } : i)),
      )
    } catch (err) {
      showToast.error(
        getErrorMessage(err, 'Não foi possível alterar o estado da instituição.'),
      )
    } finally {
      setPendingToggleId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Instituições</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerir escolas e unidades cadastradas na plataforma.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="shrink-0 gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-5 w-5" aria-hidden />
          Nova instituição
        </Button>
      </div>

      {loadingList ? (
        <p className="text-sm text-gray-500">A carregar instituições…</p>
      ) : institutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <Building2 className="mb-3 h-12 w-12 text-gray-300" aria-hidden />
          <p className="text-gray-600">Nenhuma instituição encontrada.</p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mt-4"
            onClick={() => setCreateOpen(true)}
          >
            Cadastrar primeira instituição
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {institutions.map((inst) => {
            const active = isInstitutionActive(inst)
            const locationLabel = [inst.cityName, inst.stateAbbreviation ?? inst.stateName]
              .filter(Boolean)
              .join(', ')

            return (
              <li
                key={inst.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex h-40 items-center justify-center bg-gray-100">
                  {inst.photoUrl ? (
                    <img
                      src={inst.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-14 w-14 text-gray-300" aria-hidden />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="line-clamp-2 font-semibold text-brand-dark">{inst.name}</h2>
                    {locationLabel ? (
                      <p className="mt-1 text-sm text-gray-500">{locationLabel}</p>
                    ) : null}
                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        active
                          ? 'bg-green-50 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <Button
                      type="button"
                      variant={active ? 'outlined' : 'secondary'}
                      size="sm"
                      fullWidth
                      loading={pendingToggleId === inst.id}
                      disabled={
                        (pendingToggleId !== null && pendingToggleId !== inst.id) ||
                        pendingDeleteId !== null
                      }
                      onClick={() => void handleToggleActive(inst)}
                    >
                      {active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        className="flex-1 gap-1.5"
                        disabled={pendingDeleteId !== null || pendingToggleId !== null}
                        onClick={() => handleEdit(inst)}
                      >
                        <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        className="flex-1 gap-1.5 text-brand-red hover:bg-red-50 hover:text-brand-red"
                        loading={pendingDeleteId === inst.id}
                        disabled={
                          pendingToggleId !== null ||
                          (pendingDeleteId !== null && pendingDeleteId !== inst.id)
                        }
                        onClick={() => void handleDelete(inst)}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <CreateInstitutionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => void loadInstitutions()}
      />

      <EditInstitutionModal
        isOpen={editOpen}
        institution={selectedInstitution}
        onClose={handleCloseEdit}
        onSuccess={() => void loadInstitutions()}
      />
    </div>
  )
}
