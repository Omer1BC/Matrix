from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain

load_dotenv()

memory = ConversationBufferMemory(input_key="input",memory_key="history", return_messages=True)

prompt = ChatPromptTemplate.from_messages([
    ("system","""You are a helpful technical interviewer. The question is {question}"""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}. For reference here is my code: {code}")
    ]
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0,)
conversation = LLMChain(
    llm=llm,
    memory=memory,
    verbose=True,
    prompt=prompt,
)
def get_next_conversation(input,code,question):
    return {"response": conversation.run({"input": input, "code" : code, "question": question})}



