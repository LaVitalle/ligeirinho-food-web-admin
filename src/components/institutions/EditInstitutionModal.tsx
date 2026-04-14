import { Camera } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { TextInput } from '../ui/text-input'
import {
  type Institution,
  updateInstitution,
} from '../../lib/institutionsApi'
import { fetchCitiesByStateId, fetchStates, type StateDto } from '../../lib/locationApi'
import { showToast } from '../../lib/toast'

export interface EditInstitutionModalProps {
  isOpen: boolean
  institution: Institution | null
  onClose: () => void
  onSuccess: () => void
}

type FieldErrors = {
  name?: string
  stateId?: string
  cityId?: string
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return 'Não foi possível guardar as alterações.'
}

const NAME_MAX = 150

function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

export function EditInstitutionModal({
  isOpen,
  institution,
  onClose,
  onSuccess,
}: EditInstitutionModalProps) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const [initialPhotoUrl, setInitialPhotoUrl] = useState<string | null>(null)

  const [states, setStates] = useState<StateDto[]>([])
  const [cities, setCities] = useState<Awaited<ReturnType<typeof fetchCitiesByStateId>>>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const clearNewPhoto = useCallback(() => {
    setNewPhotoPreview((prev) => {
      revokeIfBlob(prev)
      return null
    })
    setPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  useEffect(() => {
    if (!isOpen || !institution) return

    let cancelled = false
    const inst = institution

    const load = async () => {
      setErrors({})
      clearNewPhoto()
      setInitialPhotoUrl(inst.photoUrl ?? null)

      setLoadingStates(true)
      try {
        const list = await fetchStates()
        if (!cancelled) setStates(list)
      } catch {
        if (!cancelled) {
          showToast.error('Não foi possível carregar os estados.')
          setStates([])
        }
      } finally {
        if (!cancelled) setLoadingStates(false)
      }

      if (cancelled) return

      setName(inst.name)
      setStateId(String(inst.stateId))

      setLoadingCities(true)
      try {
        const cityList = await fetchCitiesByStateId(inst.stateId)
        if (!cancelled) {
          setCities(cityList)
          setCityId(String(inst.cityId))
        }
      } catch {
        if (!cancelled) {
          showToast.error('Não foi possível carregar as cidades.')
          setCities([])
          setCityId('')
        }
      } finally {
        if (!cancelled) setLoadingCities(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isOpen, institution, clearNewPhoto])

  const handleStateChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    setStateId(v)
    setCityId('')
    setErrors((prev) => ({ ...prev, stateId: undefined, cityId: undefined }))

    if (!v) {
      setCities([])
      return
    }

    const num = Number(v)
    if (Number.isNaN(num)) return

    setLoadingCities(true)
    try {
      const list = await fetchCitiesByStateId(num)
      setCities(list)
    } catch {
      showToast.error('Não foi possível carregar as cidades.')
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      revokeIfBlob(newPhotoPreview)
    }
  }, [newPhotoPreview])

  const applyPhotoFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) showToast.error('Selecione um ficheiro de imagem.')
      return
    }
    setNewPhotoPreview((prev) => {
      revokeIfBlob(prev)
      return URL.createObjectURL(file)
    })
    setPhotoFile(file)
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    applyPhotoFile(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0] ?? null
    applyPhotoFile(file)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const validate = (): boolean => {
    const next: FieldErrors = {}
    const trimmed = name.trim()
    if (!trimmed) next.name = 'Nome é obrigatório.'
    else if (trimmed.length > NAME_MAX)
      next.name = `Máximo de ${NAME_MAX} caracteres.`
    if (!stateId) next.stateId = 'Selecione o estado.'
    if (!cityId) next.cityId = 'Selecione a cidade.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!institution) return
    if (!validate()) return

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('stateId', stateId)
    formData.append('cityId', cityId)
    if (photoFile) formData.append('photo', photoFile)

    setSubmitting(true)
    try {
      await updateInstitution(institution.id, formData)
      showToast.success('Instituição atualizada com sucesso.')
      clearNewPhoto()
      onClose()
      onSuccess()
    } catch (err) {
      showToast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !institution) return null

  const displayPhoto = newPhotoPreview ?? initialPhotoUrl ?? null

  const stateOptions = states.map((s) => ({
    value: String(s.id),
    label: `${s.name} (${s.abbreviation})`,
  }))

  const cityOptions = cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="mb-6 text-xl font-bold text-brand-dark">
          Editar Instituição
        </h2>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-brand-dark">
              Foto da instituição
              <span className="font-normal text-gray-500"> (recomendado 512×512 px)</span>
            </p>
            <button
              type="button"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 transition-colors hover:border-brand-orange hover:bg-orange-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Substituir foto da instituição"
                onChange={onFileChange}
              />
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="Pré-visualização"
                  className="h-32 w-32 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white ring-2 ring-gray-200">
                  <Camera className="h-10 w-10 text-gray-400" aria-hidden />
                </div>
              )}
              <p className="text-center text-sm text-gray-600">
                Arraste uma imagem ou clique para substituir a foto
              </p>
            </button>
          </div>

          <TextInput
            id="edit-institution-name"
            name="name"
            label="Nome"
            required
            maxLength={NAME_MAX}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da instituição"
            error={errors.name}
            autoComplete="organization"
          />

          <Select
            id="edit-institution-state"
            name="stateId"
            label="Estado"
            required
            value={stateId}
            onChange={handleStateChange}
            options={stateOptions}
            disabled={loadingStates || submitting}
            placeholder={loadingStates ? 'A carregar…' : 'Selecione o estado'}
            error={errors.stateId}
          />

          <Select
            id="edit-institution-city"
            name="cityId"
            label="Cidade"
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            options={cityOptions}
            disabled={!stateId || loadingCities || submitting}
            placeholder={
              !stateId
                ? 'Selecione primeiro o estado'
                : loadingCities
                  ? 'A carregar…'
                  : 'Selecione a cidade'
            }
            error={errors.cityId}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outlined"
              size="md"
              className="sm:min-w-[7rem]"
              disabled={submitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="sm:min-w-[7rem]"
              loading={submitting}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
