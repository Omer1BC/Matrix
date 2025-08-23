from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain

load_dotenv()

memory = ConversationBufferMemory(input_key="input",memory_key="history", return_messages=True)

prompt = ChatPromptTemplate.from_messages([
    ("system","""You are a helpful technical interviewer. The question is {question}. They are in the early stages of writting this problem and you want to steer them in the right direction while not being overly helpful. Remember, you want the candidate to to think through the problem themselves, after all"""),
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
    return {"response": conversation.run({"input": input + "I don't want you to elaborate on how it's solved but just be as concise as possible", "code" : code, "question": question})}



