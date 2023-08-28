import React from 'react'
import useRequest from '@/hooks/useRequest'

import Item from './components/Item'
import { Tabs } from 'antd'
import Page from '..'

const Info: React.FC<{
  connection: APP.Connection
  pageKey: string
}> = ({ connection, pageKey }) => {
  const { data, fetch, loading } = useRequest<Array<Record<string, string>>>(
    'server/info',
    connection.id
  )

  const node = React.useMemo(() => {
    if (data?.length === 1) {
      return <Item data={data[0]}></Item>
    } else {
      return (
        <Tabs
          defaultActiveKey="0"
          tabPosition="right"
          items={data?.map((v, index) => {
            return {
              label: `Server#${index}`,
              key: index.toString(),
              children: <Item data={v}></Item>
            }
          })}
        ></Tabs>
      )
    }
  }, [data])
  return (
    <Page onRefresh={fetch} pageKey={pageKey} loading={loading}>
      {node}
    </Page>
  )
}
export default Info
