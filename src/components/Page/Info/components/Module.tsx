import React from 'react'
import { Card, Table } from 'antd'
import { useTranslation } from 'react-i18next'
import request from '@/utils/request'
import useRequest from '@/hooks/useRequest'

interface ModuleInterface {
  name: string
  ver: string
  args: string
  path: string
}

const Module: React.FC<{
  connection: APP.Connection
}> = ({ connection }) => {
  const { t } = useTranslation()

  const { data } = useRequest<ModuleInterface[]>('server/module', connection.id)

  React.useEffect(() => {
    request('server/module', connection.id)
  }, [connection])

  return (
    <Card title={t('Module')} className="w-full">
      <Table
        rowKey={'name'}
        bordered
        pagination={false}
        dataSource={data}
        columns={[
          { dataIndex: 'name', title: 'name', align: 'center' },
          { dataIndex: 'ver', title: 'ver', align: 'center' },
          { dataIndex: 'path', title: 'path', align: 'center' },
          { dataIndex: 'args', title: 'args', align: 'center' }
        ]}
      ></Table>
    </Card>
  )
}
export default Module
