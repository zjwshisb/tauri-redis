use std::{fs};
use rusqlite::{self, Connection};
use dirs_next;
use crate::err::CusError;

const DATA_NAME: &str = "data.db";
const DATA_DIR : &str = "redis";

pub fn get_sqlite_client() -> Result<Connection, CusError> {
    let path = get_data_path();
    let conn = rusqlite::Connection::open(path)?;
    Ok(conn)
}

pub fn init_sqlite () {
    let client  = get_sqlite_client().unwrap();
    client.execute(
        "CREATE TABLE IF NOT EXISTS connections (
            id    INTEGER PRIMARY KEY,
            host  TEXT NOT NULL,
            port  INTEGER NOT NULL,
            password  TEXT
        )",
        (), // empty list of parameters.
    ).unwrap();
}

fn get_data_path() -> String {
    if let Some(data_dir) = dirs_next::data_dir() {
        let mut full_dir: String = String::from(data_dir.to_str().unwrap());
        full_dir.push_str("/");
        full_dir.push_str(DATA_DIR);
        let full_dir_meta = fs::metadata(&full_dir);
        match full_dir_meta {
            Err(err) => {
                fs::create_dir(&full_dir).unwrap();
            }
            _ => {}
        }
        full_dir.push_str("/");
        full_dir.push_str(DATA_NAME);
        return full_dir
    } else {
        panic!("sqlite error: data dir not exists")
    }
}
