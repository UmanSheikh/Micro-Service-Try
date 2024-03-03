from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
conn = mysql.connector.connect(
    host="localhost",
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database="apis"
)

cursor = conn.cursor()

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS Todo(
        id int auto_increment primary key,
        todo_name varchar(100),
        todo_des varchar(500),
        todo_status int
    );
    """
)
conn.commit()

class Todo(BaseModel):
    todo_name: str
    todo_des: str
    todo_status: int


@app.get("/get-all-todos")
def get_all_todos():
    cursor.execute(
        """
        SELECT * FROM Todo;
        """
    )
    return cursor.fetchall()

@app.post("/create-todo")
def create_todo(todo: Todo):
    try:
        cursor.execute(f"""
            INSERT INTO Todo(todo_name, todo_des, todo_status) VALUES('{todo.todo_name}', '{todo.todo_des}', '{todo.todo_status}');
        """)
        conn.commit()
    except Exception as e:
        return {"Error": str(e)}
    
    return {"Message": "Todo Successfully created"}

@app.delete("/delete/todo/{id}")
def delete_todo(id: int):
    try:
        cursor.execute(
            f"""
            DELETE FROM Todo where id = {id};
            """)
        conn.commit()
    except Exception as e:
        return {"Error": str(e)}
    
    return {"Message": "Todo deleted Succesfully"}

@app.patch("/update/todo/{id}")
def update_todo(id: int, name, des, status):
    try:
        cursor.execute(
            f"""
            UPDATE Todo
            SET todo_name = '{name}', todo_des = '{des}', todo_status = {status}
            WHERE id = {id};
            """
        )
    except Exception as e:
        return {"Error": str(e)}

    return {"Message": "Todo Updated Successfully"}