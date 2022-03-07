import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'

import LockedIcon from '@assets/icons/locked-icon'

import Modal from '@components/modal'
import Button from '@components/button'
import ImageUploader from '@components/image-uploader'

import { ApplicationContext } from '@contexts/application'

import { INetwork } from '@interfaces/network'

import useApi from '@x-hooks/use-api'
import { addToast } from '@contexts/reducers/add-toast'
import { psReadAsText } from '@helpers/file-reader'

const defaultImage = {
  preview: undefined,
  raw: undefined
}

const differentOrUndefined = (objectA, objectB, property) => objectA[property] !== objectB[property] ? objectA[property] : undefined

export default function OverrideNameModal({
  network,
  show = false,
  onCloseClick = () => {}
}) {
  const { t } = useTranslation(['common', 'parity'])

  const [logoIcon, setLogoIcon] = useState(defaultImage)
  const [fullLogo, setFullLogo] = useState(defaultImage)
  const [isExecuting, setIsExecuting] = useState(false)
  const [newNetwork, setNewNetwork] = useState<INetwork>()

  const { updateNetwork } = useApi()

  const {
    dispatch,
    state: { currentAddress, githubLogin }
  } = useContext(ApplicationContext)

  function isButtonDisabled(): boolean {
    return (
      newNetwork?.name?.trim() === '' ||
      isExecuting ||
      (network?.name === newNetwork?.name &&
        network?.description === newNetwork?.description &&
        network?.logoIcon === newNetwork?.logoIcon &&
        network?.fullLogo === newNetwork?.fullLogo &&
        logoIcon.raw === undefined &&
        fullLogo.raw === undefined)
    )
  }

  function setDefaults() {
    setNewNetwork(undefined)
    setLogoIcon(defaultImage)
    setFullLogo(defaultImage)
  }

  function handleFielsChanged(label, value) {
    setNewNetwork((oldState) => ({
      ...oldState,
      [label]: value
    }))
  }

  async function handleSubmit() {
    if (!currentAddress || !githubLogin) return

    setIsExecuting(true)
    
    const json = {
      githubLogin,
      override: true,
      creator: currentAddress,
      networkAddress: newNetwork.networkAddress,
      name: differentOrUndefined(newNetwork, network, 'name'),
      description: differentOrUndefined(newNetwork, network, 'description'),
      logoIcon: logoIcon.raw !== undefined ? await psReadAsText(logoIcon.raw) : undefined, 
      fullLogo: fullLogo.raw !== undefined ? await psReadAsText(fullLogo.raw) : undefined
    }

    updateNetwork(json)
      .then((result) => {
        dispatch(
          addToast({
            type: 'success',
            title: t('actions.success'),
            content: t('custom-network:messages.refresh-the-page')
          })
        )

        setIsExecuting(false)
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: t('actions.failed'),
            content: t('custom-network:errors.failed-to-update-network', {
              error
            })
          })
        )

        setIsExecuting(false)
        console.log(error)
      })
  }

  useEffect(setDefaults, [show])
  useEffect(() => {
    setNewNetwork(network)
  }, [network])

  return (
    <Modal
      show={show}
      onCloseClick={onCloseClick}
      title={t('parity:override-network-name')}
      titlePosition="center"
    >
      <div className="container">
        <div className="mb-2">
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t('parity:name')}
            </label>

            <input
              value={newNetwork?.name}
              type="text"
              onChange={(e) => handleFielsChanged('name', e.target.value)}
              className="form-control border-radius-8"
            />
          </div>
        </div>

        <div className="mb-2">
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t('parity:description')}
            </label>

            <textarea
              value={newNetwork?.description}
              rows={5}
              onChange={(e) =>
                handleFielsChanged('description', e.target.value)
              }
              className="form-control border-radius-8"
            />
          </div>
        </div>

        <div className="mb-2 d-flex flex-row gap-20">
          <ImageUploader
            name="logoIcon"
            value={logoIcon}
            error={logoIcon.raw && !logoIcon.raw?.type?.includes('image/svg')}
            onChange={image => setLogoIcon(image.value)}
            description={
              <>
                {t('misc.upload')} <br />{' '}
                {t(
                  'custom-network:steps.network-information.fields.logo-icon.label'
                )}
              </>
            }
          />

          <ImageUploader
            name="fullLogo"
            value={fullLogo}
            error={fullLogo.raw && !fullLogo.raw?.type?.includes('image/svg')}
            onChange={image => setFullLogo(image.value)}
            description={`${t('misc.upload')} ${t(
              'custom-network:steps.network-information.fields.full-logo.label'
            )}`}
            lg
          />
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <Button className="mr-2" disabled={isButtonDisabled()} onClick={handleSubmit}>
            {isButtonDisabled() && !isExecuting && (
              <LockedIcon className="me-2" />
            )}
            <span>{t('actions.confirm')}</span>
            {isExecuting ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ''
            )}
          </Button>
          <Button color="dark-gray" onClick={onCloseClick}>
            {t('actions.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}