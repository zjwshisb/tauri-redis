import React from 'react'

import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Descriptions, Form, Select } from 'antd'
import useConnectionOption from '@/hooks/useConnectionOption'
import useStore from '@/hooks/useStore'
import { computed } from 'mobx'
import { type FormInstance } from 'antd/es/form/Form'
import { type MigrateItem } from '../../reducer'
import useDatabaseOption from '@/hooks/useDatabaseOption'

const ConnectionSelect: React.FC<{
  title: string
  form: FormInstance<MigrateItem>
  readonlyDisabled: boolean
}> = ({ title, form, readonlyDisabled = true }) => {
  const connectionOptions = useConnectionOption(readonlyDisabled)

  const store = useStore()

  const { t } = useTranslation()

  const [connection, setConnection] = React.useState<APP.Connection>()

  const connectionStatus = computed(() => {
    if (connection === undefined) {
      return undefined
    }
    if (connection.err === undefined || connection.err === '') {
      return undefined
    }
    return 'error'
  })

  const databaseRule = computed(() => {
    if (connection === undefined) {
      return [
        {
          required: true
        }
      ]
    }
    if (!connection.is_cluster) {
      return [
        {
          required: true
        }
      ]
    }
    return undefined
  })

  React.useEffect(() => {
    form.resetFields(['database'])
  }, [connection, form])

  const databasesOption = useDatabaseOption(connection)

  return (
    <div className="flex-1 px-10 py-2 flex-shrink-0 overflow-hidden">
      <div className="text-lg mb-4">{title}</div>
      <div>
        <Form
          layout="vertical"
          size="small"
          form={form}
          validateMessages={{
            required: t('Please Select ${label}').toString()
          }}
        >
          <Form.Item
            rules={[
              {
                required: true
              }
            ]}
            label={t('Connection')}
            name={'connection_id'}
            validateStatus={connectionStatus.get()}
            help={connection?.err}
          >
            <Select
              loading={connection?.loading}
              placeholder={t('Please Select {{name}}', {
                name: t('Connection')
              })}
              size="small"
              options={connectionOptions}
              onChange={async (id) => {
                const conn = store.connection.connections.find(
                  (v) => v.id === id
                )
                if (conn !== undefined) {
                  setConnection(conn)
                  if (conn.open !== true) {
                    try {
                      await store.connection.open(conn.id)
                    } catch (e) {}
                  }
                }
              }}
            ></Select>
          </Form.Item>
          <Form.Item
            tooltip={'Cluster mode is no need'}
            label={t('Database')}
            name={'database'}
            rules={databaseRule.get()}
          >
            <Select
              placeholder={t('Please Select {{name}}', {
                name: t('Database')
              })}
              size="small"
              options={databasesOption}
              disabled={databasesOption.length === 0}
            ></Select>
          </Form.Item>
        </Form>
      </div>
      {connection != null && (
        <div className="mt-10">
          <div className="pb-2 text-blue-600 text-md">{t('Information')}</div>
          <Descriptions
            size="small"
            column={1}
            items={[
              {
                label: t('Name'),
                key: 'name',
                children: <span className="break-all">{connection.name}</span>
              },
              {
                label: t('Host'),
                key: 'host',
                children: <span className="break-all">{connection.host}</span>
              },
              {
                label: t('Port'),
                key: 'port',
                children: <span className="break-all">{connection.port}</span>
              },
              {
                label: t('Server Version'),
                key: 'version',
                children: (
                  <span className="break-all">{connection.version}</span>
                )
              }
            ]}
          ></Descriptions>
        </div>
      )}
    </div>
  )
}
export default observer(ConnectionSelect)
