#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
积分优化应用自动化测试脚本
测试完整的用户操作流程
"""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class UserFlowTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.base_url = "http://localhost:5173"
        self.test_results = []
        self.errors_found = []
        
    def setup_driver(self):
        """设置Chrome WebDriver"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            # chrome_options.add_argument("--headless")  # 取消注释以启用无头模式
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            
            print("✅ WebDriver 设置成功")
            return True
        except Exception as e:
            print(f"❌ WebDriver 设置失败: {e}")
            return False
    
    def log_test_result(self, test_name, success, message="", error=None):
        """记录测试结果"""
        result = {
            "test_name": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "error": str(error) if error else None
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
        
        if not success and error:
            self.errors_found.append({
                "test": test_name,
                "error": str(error),
                "timestamp": datetime.now().isoformat()
            })
    
    def wait_for_element(self, by, value, timeout=10):
        """等待元素出现"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            return None
    
    def wait_for_clickable(self, by, value, timeout=10):
        """等待元素可点击"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
            return element
        except TimeoutException:
            return None
    
    def test_homepage_access(self):
        """测试首页访问"""
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # 检查页面标题
            expected_title = "积分管理系统"  # 根据实际应用标题调整
            if expected_title in self.driver.title or "积分" in self.driver.title or "Reward" in self.driver.title:
                self.log_test_result("首页访问", True, "成功访问应用首页")
                return True
            else:
                self.log_test_result("首页访问", False, f"页面标题不正确: {self.driver.title}")
                return False
                
        except Exception as e:
            self.log_test_result("首页访问", False, "无法访问首页", e)
            return False
    
    def test_login(self):
        """测试登录功能"""
        try:
            # 查找登录按钮或登录链接
            login_elements = [
                (By.LINK_TEXT, "登录"),
                (By.PARTIAL_LINK_TEXT, "登录"),
                (By.XPATH, "//a[contains(text(), '登录')]"),
                (By.XPATH, "//button[contains(text(), '登录')]"),
                (By.CSS_SELECTOR, "[href='/login']"),
                (By.CSS_SELECTOR, "[href*='login']"),
            ]
            
            login_button = None
            for by, value in login_elements:
                try:
                    login_button = self.wait_for_clickable(by, value, 3)
                    if login_button:
                        break
                except:
                    continue
            
            if not login_button:
                # 直接访问登录页面
                self.driver.get(f"{self.base_url}/login")
                time.sleep(2)
            else:
                login_button.click()
                time.sleep(2)
            
            # 查找邮箱输入框
            email_selectors = [
                (By.CSS_SELECTOR, "input[type='email']"),
                (By.CSS_SELECTOR, "input[name='email']"),
                (By.CSS_SELECTOR, "input[placeholder*='邮箱']"),
                (By.CSS_SELECTOR, "input[placeholder*='email']"),
                (By.XPATH, "//input[@type='email' or contains(@placeholder, '邮箱') or contains(@placeholder, 'email')]"),
            ]
            
            email_input = None
            for by, value in email_selectors:
                try:
                    email_input = self.wait_for_element(by, value, 3)
                    if email_input:
                        break
                except:
                    continue
            
            if not email_input:
                self.log_test_result("登录测试", False, "找不到邮箱输入框")
                return False
            
            # 查找密码输入框
            password_selectors = [
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.CSS_SELECTOR, "input[name='password']"),
                (By.CSS_SELECTOR, "input[placeholder*='密码']"),
                (By.CSS_SELECTOR, "input[placeholder*='password']"),
            ]
            
            password_input = None
            for by, value in password_selectors:
                try:
                    password_input = self.wait_for_element(by, value, 3)
                    if password_input:
                        break
                except:
                    continue
            
            if not password_input:
                self.log_test_result("登录测试", False, "找不到密码输入框")
                return False
            
            # 输入测试账号信息
            email_input.clear()
            email_input.send_keys("test@example.com")
            
            password_input.clear()
            password_input.send_keys("123456")
            
            # 查找登录提交按钮
            submit_selectors = [
                (By.CSS_SELECTOR, "button[type='submit']"),
                (By.XPATH, "//button[contains(text(), '登录')]"),
                (By.XPATH, "//button[contains(text(), 'Login')]"),
                (By.CSS_SELECTOR, "form button"),
            ]
            
            submit_button = None
            for by, value in submit_selectors:
                try:
                    submit_button = self.wait_for_clickable(by, value, 3)
                    if submit_button:
                        break
                except:
                    continue
            
            if not submit_button:
                self.log_test_result("登录测试", False, "找不到登录提交按钮")
                return False
            
            # 点击登录
            submit_button.click()
            time.sleep(3)
            
            # 检查是否登录成功（检查URL变化或页面内容）
            current_url = self.driver.current_url
            if "/login" not in current_url or "首页" in self.driver.page_source or "dashboard" in current_url.lower():
                self.log_test_result("登录测试", True, "成功登录并跳转到主页")
                return True
            else:
                # 检查是否有错误信息
                error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".error, .alert-error, [class*='error']")
                if error_elements:
                    error_text = error_elements[0].text
                    self.log_test_result("登录测试", False, f"登录失败，错误信息: {error_text}")
                else:
                    self.log_test_result("登录测试", False, "登录后未正确跳转")
                return False
                
        except Exception as e:
            self.log_test_result("登录测试", False, "登录过程中发生错误", e)
            return False
    
    def test_homepage_features(self):
        """测试首页功能展示"""
        try:
            # 确保在首页
            if "/login" in self.driver.current_url:
                self.driver.get(self.base_url)
                time.sleep(2)
            
            # 检查首页关键元素
            key_elements = [
                "积分", "推荐", "优化", "商家", "支付", "历史",
                "points", "recommend", "merchant", "payment", "history"
            ]
            
            found_elements = 0
            page_source = self.driver.page_source.lower()
            
            for element in key_elements:
                if element.lower() in page_source:
                    found_elements += 1
            
            if found_elements >= 3:
                self.log_test_result("首页功能展示", True, f"首页包含 {found_elements} 个关键功能元素")
                return True
            else:
                self.log_test_result("首页功能展示", False, f"首页关键功能元素不足，仅找到 {found_elements} 个")
                return False
                
        except Exception as e:
            self.log_test_result("首页功能展示", False, "检查首页功能时发生错误", e)
            return False
    
    def test_navigation_pages(self):
        """测试导航页面访问"""
        pages_to_test = [
            ("/payment-methods", "支付方式管理"),
            ("/points-history", "积分历史"),
            ("/merchants", "商家推荐"),
            ("/profile", "个人资料"),
            ("/settings", "个人设置")
        ]
        
        success_count = 0
        
        for path, page_name in pages_to_test:
            try:
                self.driver.get(f"{self.base_url}{path}")
                time.sleep(2)
                
                # 检查页面是否正常加载
                if "404" not in self.driver.page_source and "Not Found" not in self.driver.page_source:
                    # 检查页面是否有内容
                    body_text = self.driver.find_element(By.TAG_NAME, "body").text
                    if len(body_text.strip()) > 10:  # 页面有实际内容
                        self.log_test_result(f"{page_name}页面", True, "页面正常加载")
                        success_count += 1
                    else:
                        self.log_test_result(f"{page_name}页面", False, "页面内容为空")
                else:
                    self.log_test_result(f"{page_name}页面", False, "页面返回404错误")
                    
            except Exception as e:
                self.log_test_result(f"{page_name}页面", False, "页面访问失败", e)
        
        return success_count >= len(pages_to_test) // 2  # 至少一半页面正常
    
    def test_interactive_elements(self):
        """测试页面交互元素"""
        try:
            # 回到首页
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # 查找可点击的按钮和链接
            clickable_elements = self.driver.find_elements(By.CSS_SELECTOR, "button, a[href], [role='button']")
            
            interactive_count = 0
            for element in clickable_elements[:5]:  # 测试前5个元素
                try:
                    if element.is_displayed() and element.is_enabled():
                        interactive_count += 1
                except:
                    continue
            
            if interactive_count >= 3:
                self.log_test_result("交互元素测试", True, f"找到 {interactive_count} 个可交互元素")
                return True
            else:
                self.log_test_result("交互元素测试", False, f"可交互元素不足，仅找到 {interactive_count} 个")
                return False
                
        except Exception as e:
            self.log_test_result("交互元素测试", False, "测试交互元素时发生错误", e)
            return False
    
    def check_console_errors(self):
        """检查浏览器控制台错误"""
        try:
            logs = self.driver.get_log('browser')
            error_logs = [log for log in logs if log['level'] == 'SEVERE']
            
            if error_logs:
                error_messages = [log['message'] for log in error_logs]
                self.log_test_result("控制台错误检查", False, f"发现 {len(error_logs)} 个严重错误")
                for i, error in enumerate(error_messages[:3]):  # 只显示前3个错误
                    print(f"  错误 {i+1}: {error}")
                return False
            else:
                self.log_test_result("控制台错误检查", True, "未发现严重的控制台错误")
                return True
                
        except Exception as e:
            self.log_test_result("控制台错误检查", False, "无法检查控制台错误", e)
            return False
    
    def run_full_test(self):
        """运行完整测试流程"""
        print("🚀 开始自动化测试...")
        print("=" * 50)
        
        if not self.setup_driver():
            return False
        
        try:
            # 执行测试步骤
            test_steps = [
                ("首页访问", self.test_homepage_access),
                ("用户登录", self.test_login),
                ("首页功能", self.test_homepage_features),
                ("页面导航", self.test_navigation_pages),
                ("交互元素", self.test_interactive_elements),
                ("控制台错误", self.check_console_errors),
            ]
            
            passed_tests = 0
            total_tests = len(test_steps)
            
            for step_name, test_func in test_steps:
                print(f"\n📋 执行测试: {step_name}")
                try:
                    if test_func():
                        passed_tests += 1
                except Exception as e:
                    self.log_test_result(step_name, False, "测试执行异常", e)
            
            # 生成测试报告
            self.generate_report(passed_tests, total_tests)
            
            return passed_tests == total_tests
            
        finally:
            if self.driver:
                self.driver.quit()
                print("\n🔚 浏览器已关闭")
    
    def generate_report(self, passed_tests, total_tests):
        """生成测试报告"""
        print("\n" + "=" * 50)
        print("📊 测试报告")
        print("=" * 50)
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"总测试数: {total_tests}")
        print(f"通过测试: {passed_tests}")
        print(f"失败测试: {total_tests - passed_tests}")
        print(f"成功率: {success_rate:.1f}%")
        
        if self.errors_found:
            print("\n❌ 发现的问题:")
            for i, error in enumerate(self.errors_found, 1):
                print(f"{i}. {error['test']}: {error['error']}")
        
        # 保存详细报告到文件
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": success_rate
            },
            "test_results": self.test_results,
            "errors_found": self.errors_found
        }
        
        try:
            with open("tests/test_report.json", "w", encoding="utf-8") as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
            print(f"\n📄 详细报告已保存到: tests/test_report.json")
        except Exception as e:
            print(f"\n⚠️  保存报告失败: {e}")
        
        if success_rate >= 80:
            print("\n🎉 测试整体通过！应用功能正常。")
        else:
            print("\n⚠️  测试发现问题，需要修复后重新测试。")

def main():
    """主函数"""
    tester = UserFlowTest()
    success = tester.run_full_test()
    
    if success:
        print("\n✅ 所有测试通过！")
        return 0
    else:
        print("\n❌ 部分测试失败，请检查问题并修复。")
        return 1

if __name__ == "__main__":
    exit(main())