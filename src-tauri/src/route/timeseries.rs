use crate::{
    connection::Manager,
    err::CusError,
    request::{FieldValueArgs, FieldValueItem, NameArgs, RangeArgs},
    response::Field,
    response
};
use redis::cmd;
use serde::Deserialize;

pub async fn info(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<Vec<Field>, CusError> {
    let args: NameArgs = serde_json::from_str(&payload)?;
    let value: Vec<redis::Value> = manager
        .execute(cid, cmd("TS.INFO").arg(args.name).arg("DEBUG"), args.db)
        .await?;
    let resp = response::build_fields(&value)?;
    Ok(resp)
}

pub async fn range(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<Vec<Field>, CusError> {
    let args: NameArgs = serde_json::from_str(&payload)?;
    let value: Vec<redis::Value> = manager
        .execute(
            cid,
            cmd("TS.RANGE").arg(args.name).arg("-").arg("+"),
            args.db,
        )
        .await?;
    response::build_simple_fields(&value)
}

pub async fn add(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<i64, CusError> {
    let args: FieldValueArgs<i64, i64> = serde_json::from_str(&payload)?;
    manager
        .execute(
            cid,
            cmd("TS.ADD").arg(args.name).arg(args.value).arg(args.field),
            args.db,
        )
        .await
}

pub async fn del(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<i64, CusError> {
    let args: RangeArgs = serde_json::from_str(&payload)?;
    manager
        .execute(
            cid,
            cmd("TS.DEL").arg(args.name).arg(args.start).arg(args.end),
            args.db,
        )
        .await
}

pub async fn incrby(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<i64, CusError> {
    let args: FieldValueArgs<Option<i64>> = serde_json::from_str(&payload)?;
    let mut cmd = redis::cmd("TS.INCRBY");
    cmd.arg(args.name).arg(args.field).arg(args.value);
    if let Some(i) = args.value {
        cmd.arg(("TIMESTAMP", i));
    }
    manager.execute(cid, &mut cmd, args.db).await
}

pub async fn decrby(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<i64, CusError> {
    let args: FieldValueArgs<Option<i64>> = serde_json::from_str(&payload)?;
    let mut cmd = redis::cmd("TS.DECRBY");
    cmd.arg(args.name).arg(args.field).arg(args.value);
    if let Some(i) = args.value {
        cmd.arg(("TIMESTAMP", i));
    }
     manager.execute(cid, &mut cmd, args.db).await
}

#[derive(Deserialize)]
struct AlterArgs {
    name: String,
    db: u8,
    rentention: Option<i64>,
    size: Option<i64>,
    encoding: Option<String>,
    policy: Option<String>,
    labels: Option<Vec<FieldValueItem<String>>>,
}

pub async fn alter(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<String, CusError> {
    let args: AlterArgs = serde_json::from_str(&payload)?;
    let mut cmd = cmd("TS.ALTER");
    cmd.arg(args.name);
    if let Some(v) = args.rentention {
        cmd.arg(("RETENTION", v));
    }
    if let Some(v) = args.size {
        cmd.arg(("CHUNK_SIZE", v));
    }
    if let Some(v) = args.policy {
        cmd.arg(("DUPLICATE_POLICY", v));
    }
    if let Some(v) = args.labels {
        let mut labels = vec![];
        for f in v {
            labels.push(f.field.clone());
            labels.push(f.value.clone());
        }

        cmd.arg(("LABELS", labels));
    }
    manager.execute(cid, &mut cmd, Some(args.db)).await
}

pub async fn create(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<String, CusError> {
    let args: AlterArgs = serde_json::from_str(&payload)?;
    let mut cmd = cmd("TS.CREATE");
    cmd.arg(args.name);
    if let Some(v) = args.rentention {
        cmd.arg(("RETENTION", v));
    }
    if let Some(v) = args.encoding {
        cmd.arg(("ENCODING", v));
    }
    if let Some(v) = args.size {
        cmd.arg(("CHUNK_SIZE", v));
    }
    if let Some(v) = args.policy {
        cmd.arg(("DUPLICATE_POLICY", v));
    }
    if let Some(v) = args.labels {
        let mut labels = vec![];
        for f in v {
            labels.push(f.field.clone());
            labels.push(f.value.clone());
        }
        cmd.arg(("LABELS", labels));
    }
    manager.execute(cid, &mut cmd, Some(args.db)).await
}

#[derive(Deserialize)]
struct CreateRuleArgs {
    source_key: String,
    dest_key: String,
    db: u8,
    aggregation: String,
    bucket_duration: i64,
    align_timestamp: Option<i64>,
}

pub async fn create_rule(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<String, CusError> {
    let args: CreateRuleArgs = serde_json::from_str(&payload)?;
    let mut cmd = cmd("TS.CREATERULE");
    cmd.arg(args.source_key).arg(args.dest_key).arg((
        "AGGREGATION",
        args.aggregation,
        args.bucket_duration,
    ));
    if let Some(v) = args.align_timestamp {
        cmd.arg(v);
    }
    manager.execute(cid, &mut cmd, Some(args.db)).await
}

#[derive(Deserialize)]
struct DeleteRuleArgs {
    source_key: String,
    dest_key: String,
    db: u8,
}
pub async fn delete_rule(
    payload: String,
    cid: u32,
    manager: tauri::State<'_, Manager>,
) -> Result<String, CusError> {
    let args: DeleteRuleArgs = serde_json::from_str(&payload)?;
    let mut cmd = cmd("TS.DELETERULE");
    cmd.arg(args.source_key).arg(args.dest_key);
    manager.execute(cid, &mut cmd, Some(args.db)).await
}
