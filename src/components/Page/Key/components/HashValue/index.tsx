import React, { useContext, useState } from 'react'
import { Button, Input } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import HSet from './components/HSet'
import HDel from './components/HDel'
import { useTranslation } from 'react-i18next'
import CusTable from '@/components/CusTable'
import FieldViewer from '@/components/FieldViewer'
import context from '../../context'
import Editable from '@/components/Editable'
import { useFieldScan } from '@/hooks/useFieldScan'
import useTableColumn from '@/hooks/useTableColumn'
import ValueLayout from '../ValueLayout'
import LoadMore from '@/components/LoadMore'
import Highlighter from 'react-highlight-words'

const HashValue: React.FC<{
  keys: APP.HashKey
  onRefresh: () => void
}> = ({ keys, onRefresh }) => {
  const connection = useContext(context)
  const [params, setParams] = useState({
    search: ''
  })
  const { t } = useTranslation()

  const { fields, getFields, loading, more, getAllFields } =
    useFieldScan<APP.Field>('key/hash/hscan', keys, params)

  const columns = useTableColumn<APP.Field>(
    [
      {
        dataIndex: 'field',
        width: 300,
        title: (
          <div className="flex items-center justify-center">
            <div>{t('Field Name')}</div>
            <div
              className="ml-2"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Input.Search
                allowClear
                size="small"
                onSearch={(e) => {
                  setParams({
                    search: e
                  })
                }}
              />
            </div>
          </div>
        ),
        render(value) {
          return (
            <Highlighter
              textToHighlight={value}
              searchWords={[params.search]}
            />
          )
        }
      },
      {
        dataIndex: 'value',
        title: t('Field Value'),
        render(_, record) {
          return <FieldViewer content={_}></FieldViewer>
        }
      }
    ],
    {
      width: 200,
      fixed: 'right',
      render(_, record, index) {
        return (
          <div>
            <Editable connection={connection}>
              <HSet
                trigger={<Button icon={<EditOutlined />} type="link"></Button>}
                keys={keys}
                field={record}
                onSuccess={onRefresh}
              />
            </Editable>
            <Editable connection={connection}>
              <HDel keys={keys} field={record} onSuccess={onRefresh} />
            </Editable>
          </div>
        )
      }
    },
    connection !== undefined && !connection.readonly
  )

  return (
    <ValueLayout
      actions={
        <HSet
          keys={keys}
          onSuccess={onRefresh}
          trigger={<Button type="primary">{'HSET'}</Button>}
        />
      }
    >
      <CusTable
        loading={loading}
        rowKey={'field'}
        more={more}
        onLoadMore={getFields}
        dataSource={fields}
        columns={columns}
      ></CusTable>
      <div className="py-2 mb-4">
        <LoadMore
          disabled={!more}
          loading={loading}
          onGet={async () => await getFields()}
          onGetAll={getAllFields}
        />
      </div>
    </ValueLayout>
  )
}
export default HashValue
