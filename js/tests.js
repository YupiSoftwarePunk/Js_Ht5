import { analyzeText, getFriendlyDate } from './navigation.js';
import { TextFormatter } from './text-formatter.js';

window.analyzeText = analyzeText;

console.group("Тесты: TextFormatter.escapeHtml");

const test1 = TextFormatter.escapeHtml('<div>"Hello" & \'World\'</div>');
console.assert(test1 === '&lt;div&gt;&quot;Hello&quot; &amp; &#39;World&#39;&lt;&#x2F;div&gt;', "Ошибка: базовое экранирование");

console.assert(TextFormatter.escapeHtml('') === '', "Ошибка: пустая строка должна возвращать пустую строку");

console.assert(TextFormatter.escapeHtml(null) === '', "Ошибка: нестроковые данные должны возвращать пустую строку");

console.log("Тесты завершены!");
console.groupEnd();


console.group("Тесты: TextFormatter.truncate");

const trunc40 = TextFormatter.truncate(10, '...');

console.assert(trunc40("Это очень длинный текст") === "Это очень...", "Ошибка: текст не был обрезан правильно");

console.assert(trunc40("Привет") === "Привет", "Ошибка: короткий текст не должен обрезаться");

console.assert(trunc40("") === "", "Ошибка: пустая строка");

console.assert(trunc40("Текст с пробелом          ") === "Текст с пр...", "Ошибка: пробелы в конце должны удаляться перед лимитом");

console.log("Тесты завершены!");
console.groupEnd();


const sanitizer = TextFormatter.createSanitizer();

const getHTML = (fragment) => {
    const div = document.createElement('div');
    div.appendChild(fragment);
    return div.innerHTML;
};

console.group("Тестирование Sanitizer");

console.assert(getHTML(sanitizer("Просто текст")) === "Просто текст", 
    "Ошибка: обычный текст должен оставаться без изменений");

console.assert(getHTML(sanitizer("<b>Жирный</b> <i>Курсив</i>")) === "<b>Жирный</b> <i>Курсив</i>", 
    "Ошибка: разрешенные теги (B, I) должны сохраняться");

console.assert(getHTML(sanitizer("<div>Секрет</div>")) === "", 
    "Ошибка: запрещенный тег DIV и его содержимое должны быть удалены");

console.assert(getHTML(sanitizer("<script>alert('XSS')</script>")) === "", 
    "Ошибка: тег SCRIPT должен быть полностью удален");

console.assert(getHTML(sanitizer('<b onclick="alert(1)">Кликни меня</b>')) === "<b>Кликни меня</b>", 
    "Ошибка: атрибуты (onclick) должны удаляться даже у разрешенных тегов");

console.assert(getHTML(sanitizer("<p>Текст с <u>подчеркиванием</u></p>")) === "<p>Текст с <u>подчеркиванием</u></p>", 
    "Ошибка: вложенные разрешенные теги должны сохранять структуру");

console.assert(getHTML(sanitizer("")) === "", 
    "Ошибка: пустая строка должна возвращать пустой результат");

console.log("Тесты Sanitizer завершены!");
console.groupEnd();


console.group("Тесты: analyzeText");

const stats = analyzeText("Мама мыла раму. Это второе предложение!");
console.assert(stats.words === 6, "Ошибка: неверный подсчет слов");
console.assert(stats.sentences === 2, "Ошибка: неверный подсчет предложений");

const emptyStats = analyzeText("");
console.assert(emptyStats.words === 0 && emptyStats.readability == 0, "Ошибка: пустая строка должна давать нулевую статистику");

const weirdText = analyzeText("JS   инструменты...   лекция №3! ");
console.assert(weirdText.words === 4, "Ошибка: лишние пробелы не должны считаться словами");
console.assert(weirdText.sentences === 2, "Ошибка: знаки препинания (..., !) должны корректно разбивать предложения");

console.log("Тесты завершены!");
console.groupEnd();



console.group("Тесты: getFriendlyDate");

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
const oldDate = "2023-01-01";

console.assert(getFriendlyDate(twoHoursAgo).includes("2 ч. назад"), "Ошибка: неверный формат часов назад");

console.assert(getFriendlyDate(yesterday) === "Вчера", "Ошибка: должна возвращаться строка 'Вчера'");

const formattedOld = getFriendlyDate(oldDate);
console.assert(formattedOld.includes("2023"), "Ошибка: старая дата должна содержать год");
console.assert(/[а-яА-Я]/.test(formattedOld), "Ошибка: дата должна быть локализована (содержать русские буквы)");

console.log("Тесты завершены!");
console.groupEnd();
