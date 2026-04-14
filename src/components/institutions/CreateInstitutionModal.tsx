import { Camera } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from 'react'

import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { TextInput } from '../ui/text-input'
import { createInstitution } from '../../lib/institutionsApi'
import { fetchCitiesByStateId, fetchStates, type CityDto, type StateDto } from '../../lib/locationApi'
import { showToast } from '../../lib/toast'

export interface CreateInstitutionModalProps {
  isOpen: boolean
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
  return 'Não foi possível concluir o cadastro.'
}

const NAME_MAX = 150

export function CreateInstitutionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInstitutionModalProps) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [states, setStates] = useState<StateDto[]>([])
  const [cities, setCities] = useState<CityDto[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const revokePreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const resetForm = useCallback(() => {
    setName('')
    setStateId('')
    setCityId('')
    setPhotoFile(null)
    revokePreview()
    setCities([])
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [revokePreview])

  useEffect(() => {
    if (!isOpen) return

    resetForm()

    let cancelled = false
    setLoadingStates(true)
    fetchStates()
      .then((list) => {
        if (!cancelled) setStates(list)
      })
      .catch(() => {
        if (!cancelled) {
          showToast.error('Não foi possível carregar os estados.')
          setStates([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, resetForm])

  useEffect(() => {
    if (!isOpen || !stateId) {
      setCities([])
      setCityId('')
      return
    }

    const id = Number(stateId)
    if (Number.isNaN(id)) return

    let cancelled = false
    setLoadingCities(true)
    setCityId('')
    fetchCitiesByStateId(id)
      .then((list) => {
        if (!cancelled) setCities(list)
      })
      .catch(() => {
        if (!cancelled) {
          showToast.error('Não foi possível carregar as cidades.')
          setCities([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, stateId])

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

  const applyPhotoFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) showToast.error('Selecione um ficheiro de imagem.')
      return
    }
    revokePreview()
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
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
    if (!validate()) return

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('stateId', stateId)
    formData.append('cityId', cityId)
    if (photoFile) formData.append('photo', photoFile)

    setSubmitting(true)
    try {
      await createInstitution(formData)
      showToast.success('Instituição cadastrada com sucesso.')
      resetForm()
      onClose()
      onSuccess()
    } catch (err) {
      showToast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

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
          Cadastrar Nova Instituição
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
                aria-label="Carregar foto da instituição"
                onChange={onFileChange}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="h-32 w-32 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white ring-2 ring-gray-200">
                  <Camera className="h-10 w-10 text-gray-400" aria-hidden />
                </div>
              )}
              <p className="text-center text-sm text-gray-600">
                Arraste uma imagem ou clique para selecionar
              </p>
            </button>
          </div>

          <TextInput
            id="institution-name"
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
            id="institution-state"
            name="stateId"
            label="Estado"
            required
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            options={stateOptions}
            disabled={loadingStates || submitting}
            placeholder={loadingStates ? 'A carregar…' : 'Selecione o estado'}
            error={errors.stateId}
          />

          <Select
            id="institution-city"
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
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
