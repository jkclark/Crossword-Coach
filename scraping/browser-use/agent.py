import asyncio

from browser_use import Agent
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

# import os

# from langchain_deepseek import ChatDeepSeek
# from pydantic import SecretStr
# api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the model
# llm=ChatDeepSeek(base_url='https://api.deepseek.com/v1', model='deepseek-chat', api_key=SecretStr(api_key))
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
)

# If no executable_path provided, uses Playwright/Patchright's built-in Chromium
initial_actions = [
    {"open_tab": {"url": "https://www.latimes.com/games/daily-crossword"}}
]

# task = "You should see a list of crossword puzzles on the LA Times website. " \
#        "These exist within an iFrame. You shouldn't have to click on anything to see the list of crossword puzzles. " \
#        "The crossword puzzles are listed with titles that look like 'L. A. Times, ...' followed by a date and title." \
#        "Do not click on the button titled 'Sections'" \
#        "Click on the first one and allow the puzzle to load. " \
#        "Print out a list of clues for the puzzle, then exit."
task = "There is a scrollable list of crossword puzzle links in the middle of the page." \
       "Each one is titled 'L. A. Times,...' followed by a date (like Sun, Jun 22, 2025), and potentially followed by a title." \
       "Click on the first crossword-puzzle link and allow it to load." \
        "Tell me the first clue in the puzzle, then exit."

# Create agent with the model
agent = Agent(
    task=task,
    llm=llm,
    initial_actions=initial_actions,
    use_vision=False,
)

async def main():
    result = await agent.run()
    print(result)

asyncio.run(main())
