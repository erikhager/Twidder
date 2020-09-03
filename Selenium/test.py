from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import time
from datetime import date

PATH = r"C:\Users\Oskar\Documents\Twidder\chromedriver.exe"
driver = webdriver.Chrome(PATH)

driver.get("http://localhost:5000/")
print(driver.title)

# 1: Testing login with a too short password (expect to give error message)
login_email = driver.find_element_by_id("login_email")
login_email.send_keys("o2@gmail.com")
login_password = driver.find_element_by_id("login_password")
login_password.send_keys("222")
login_password.send_keys(Keys.ENTER)
time.sleep(3)

# # 2: Testing register with a too short password (expect to give error message)
register_btn = driver.find_element_by_id("register_btn")
register_btn.send_keys(Keys.ENTER)

first_name = driver.find_element_by_id("fname")
first_name.send_keys("Erik")

last_name = driver.find_element_by_id("lname")
last_name.send_keys("Häger")

gender = Select(driver.find_element_by_id("gender"))
gender.select_by_visible_text("Male")

city = driver.find_element_by_id("city")
city.send_keys("Linköping")

country = driver.find_element_by_id("country")
country.send_keys("Sverige")

email = driver.find_element_by_id("email")
email.send_keys("23232323@gmail.com")

psw1 = driver.find_element_by_id("psw1")
psw1.send_keys("222")

psw2 = driver.find_element_by_id("psw2")
psw2.send_keys("222")
psw2.send_keys(Keys.ENTER)

time.sleep(3)
driver.refresh()
time.sleep(1)

# 3: Testing to login to a valid account
login_email = driver.find_element_by_id("login_email")
login_email.send_keys("test@gmail.com")
login_password = driver.find_element_by_id("login_password")
login_password.send_keys("yfh34fd3dvsd33sdv3vds")
time.sleep(1)
login_password.send_keys(Keys.ENTER)
time.sleep(2)

# 4: Testing to post a message to the wall
wall_msg = driver.find_element_by_id("wall_msg")
wall_msg.send_keys("Todays date is: " + str(date.today()))
post_btn = driver.find_element_by_id("post btn")
post_btn.send_keys(Keys.ENTER)
time.sleep(3)
logout = driver.find_element_by_id("logout")
logout.send_keys(Keys.ENTER)
time.sleep(2)


# 5: Testing to register with no @ in email
register_btn = driver.find_element_by_id("register_btn")
register_btn.send_keys(Keys.ENTER)

first_name = driver.find_element_by_id("fname")
first_name.send_keys("Erik")

last_name = driver.find_element_by_id("lname")
last_name.send_keys("Häger")

gender = Select(driver.find_element_by_id("gender"))
gender.select_by_visible_text("Male")

city = driver.find_element_by_id("city")
city.send_keys("Linköping")

country = driver.find_element_by_id("country")
country.send_keys("Sverige")

email = driver.find_element_by_id("email")
email.send_keys("23232323.gmail.com")

psw1 = driver.find_element_by_id("psw1")
psw1.send_keys("222")

psw2 = driver.find_element_by_id("psw2")
psw2.send_keys("222")
psw2.send_keys(Keys.ENTER)

time.sleep(3)
driver.quit()