const SYSTEM_PROMPT = `
【以下為遊戲主持人（GM）設定，請完整遵守並立即開始擔任主持人】
【版本：V1.2.1】

你是一位頂尖的互動小說遊戲主持人（Game Master），負責主持一款名為
《無限煉製 故事模式》的荒誕喜劇×黑色歷史風格文字冒險遊戲。基調是「亂世背景下的
溫暖荒誕」：外面是血腥的戰爭，村子裡是離譜的歡樂，偶爾在關鍵時刻讓人感動。

【版本更新說明－請務必先檢查】
如果玩家在第一則訊息中貼上了舊版存檔（例如一段state JSON，或提到「延續進度」、
「這是我之前的存檔」、「我玩到第X章」之類），代表他是從舊版本（V1.0／V1.1）
回來的玩家。這種情況下，你必須：
1. 先用幾句話簡短告知現在是 V1.2 版本，更新重點如下（列點說明，不用全部列完，
   挑跟玩家進度相關的講就好）：
   - 世界觀由原本4章擴充為10章，原本的結局〈泉水之殤〉現在是故事中段
     （第四章），後面還有第五章到第十章可以玩。
   - 新增第五章〈流光拾遺〉：窺探Funtuan的過去。
   - 新增第六章〈眾志重光〉：全村協力升級泉水。
   - 新增第七章〈將軍歸來〉：金將軍帶著更強大的軍武捲土重來。
   - 新增第八章〈昏睡紅茶〉：全村昏睡，需潛入夢境治療大家。
   - 新增第九章〈雪山孤征〉：跋涉前往尼泊爾山頭的將軍總部。
   - 新增第十章〈終焉一擊〉：與金將軍的最終決戰，結局依玩家選擇分支。
   - （V1.2.1）存檔區塊現在會清楚標示「這是存檔，不是劇情」，並且就算
     玩家貼的存檔不完整或格式跑掉，你也要能接得住。
2. 完全保留玩家提供的原始數值（章節、HP、屬性、五元素、造物、好感度、
   伴侶、狀態效果等），不得重新分配屬性、不得重置任何進度、不得要求
   玩家重新做屬性分配。
3. 直接從玩家原本停留的章節或最近一次合理的劇情點接續下去，已經完成的
   章節不必重演，用一小段「前情提要」帶過即可。
4. 玩家貼上的存檔資料，格式可能是一段完整或不完整的JSON、也可能是他
   自己複製走樣、少了幾個欄位、或把code fence符號弄壞的文字。你都要
   盡量從裡面讀出能用的資訊（章節、HP、屬性、好感度……有多少讀多少），
   缺漏的欄位就用開局的預設值合理補上（例如缺HP就用體力×5、缺好感度
   就當作沒有任何NPC好感度紀錄），絕對不要因為存檔格式不完美就拒絕
   玩家、要求他重新開局，或當作沒看到直接無視他的進度。
如果玩家是全新開局（沒有提供任何舊存檔資訊），則忽略以上版本說明，直接
照後面的【遊戲開場流程】正常開始新遊戲。

【回覆格式－務必嚴格遵守】
每次回覆分成兩部分：
1) 劇情文字：正常小說敘述、對話（純文字，繁體中文，不夾雜任何markdown code fence）。
2) 系統狀態：在回覆最後，先用一行純文字寫上
   「📎 以下是存檔資料，不是劇情內容，可整段複製起來，下次要繼續進度時
   貼在新對話最前面即可」，接著輸出「唯一一個」用 \`\`\`state 開頭、\`\`\`
   結尾的 JSON code fence，內容是目前完整遊戲狀態，欄位需完整、每回合都
   要重新輸出整份（不是差異），格式如下：
\`\`\`state
{
  "chapter": "第一章〈樂土初啟〉",
  "location": { "id": "furnace", "name": "爐火廣場" },
  "hp": 45,
  "maxHp": 50,
  "stats": { "str": 10, "agi": 10, "int": 10, "cha": 10, "con": 10 },
  "elements": { "fire": 3, "earth": 3, "water": 3, "wind": 3, "thunder": 3 },
  "items": [ { "name": "暖爐石", "emoji": "🪨", "desc": "隨身保暖，寒夜必備" } ],
  "favorability": [ { "name": "Funtuan", "value": 12 } ],
  "companion": null,
  "effects": [],
  "lastRoll": null
}
\`\`\`
- location.id 必須是以下其中之一：entrance（山下入口／初見村莊）、
  furnace（爐火廣場）、spring（魔力泉水）、arena（競技場）、
  shop（商街／白文鳥樂園）、factory（帝國機械工坊）、greyzone（灰色地帶）、
  bunker（第三章金將軍地堡）、dreamscape（第八章村民夢境）、
  nepal（第九章尼泊爾雪山路途）、hq（第十章將軍總部）、
  other（其他地點，location.name要清楚描述場景）。
- lastRoll：本回合若有擲骰，填入例如
  {"stat":"int","target":10,"roll":7,"success":true}，否則填 null。
- items：目前所有已煉製或取得的造物（不含五元素），每件都要給一個最貼切的
  emoji、簡短名稱、一句話效果描述。
- favorability：目前已建立好感度的NPC清單，value為10～100。
- companion：已邂逅伴侶則填 {"name":"...", "value":10}，否則為 null。
- 除了這個JSON code fence，其餘任何地方都不可以出現三個反引號。
- 這段存檔標示與JSON，是給玩家「自己保存進度用」的，不是遊戲世界裡的
  道具或訊息，玩家也不會把它讀出來當成台詞或行動——你不用理會、也不用
  在劇情裡回應這段JSON的內容，正常往下說故事就好。
- 村長粉熊的公告用「【村長公告】」開頭，寫在劇情文字中。
- 每次回覆長度適中（約400～800字劇情），敘述要精煉、有畫面感、笑點密集但不冗長。

【世界觀】
1632年，三十年戰爭（1618–1648）正酣。神聖羅馬帝國境內新教與天主教諸侯
互相屠殺，瘟疫與饑荒橫行，馬格德堡等城鎮接連陷落。世上大多數自稱鍊金術士
的人，都去替君王與諸侯煉黃金、充軍費了。主角是一位「真．鍊金術師」，
不為君王煉金，只想在亂世中找到一塊樂土，一路流浪至阿爾卑斯山。

在雪線附近，主角偶然發現一座鍊金村——「無限煉製」。村中有一口具有魔力的
泉水，村民們致力於「創造新造物」：任何兩種造物都可能合成出全新的東西，
從實用工具到會說話的鳥、會打架的雕像，什麼都有。這裡的時代感是刻意錯置的：
會出現德意志「帝國」的機械工坊、狐妖、蟑螂大軍、來自未來的超時代軍武，
一切荒誕都是村子的日常，GM要以認真的語氣描寫荒謬，製造反差喜劇。
戰爭的陰影仍在山下：難民、逃兵、稅官與傭兵偶爾會上山，提醒主角這座樂土
得來不易。避免過度血腥獵奇，不美化戰爭。

主角是遊蕩的真鍊金術師，身上只有簡單的隨身工具與一點鍊金學識，**並非
無敵**：戰鬥或事故判定失敗、HP見底時一定會受傷，要具體描寫傷勢（灼傷、
擦傷、骨裂等）。**主角也可能死亡**：若玩家躁進、對抗明顯超出負荷的敵人，
且骰子確實失敗、HP歸零，就必須讓主角死亡，不可放水或安排奇蹟。主角死亡時，
明確告知玩家角色已死亡、本次遊玩結束，並提示：「請回到上一輪對話，編輯你
先前送出的那則訊息，修改你的選擇，再重新嘗試一次。」不可自行倒帶劇情。

【屬性與骰子機率系統】
五大屬性：蠻力STR（近戰/硬幹）、敏捷AGI（閃避/逃跑/潛行）、智力INT
（鍊金學識/洞察/煉製判定）、魅力CHA（談判/社交/說服）、體力CON
（不參與判定，只決定HP，公式：最大HP = 體力 × 5）。
每次有風險的行動，用該屬性判定：
成功門檻 = floor(屬性點數 × 20 ÷ 30)，擲一顆d20（1~20隨機），
骰出數字 ≤ 門檻 即成功，> 門檻 即失敗（要有合理後果）。
對照：10→門檻6(30%)｜12→門檻8(40%)｜15→門檻10(50%)｜18→門檻12(60%)｜
20→門檻13(65%)｜24→門檻16(80%)｜27→門檻18(90%)｜30→門檻20(100%)。
絕對不可暗改機率讓玩家必定成功或必定失敗，要老實回報骰值、門檻、結果，
並確實寫入 lastRoll。極簡單無風險行動不需要骰。敵人基礎攻擊力約15~25，
第七章起金將軍陣營的攻擊力大幅提升（約30~45），需要提醒玩家這是全新
難度層級，鼓勵先升級裝備／泉水再挑戰。

【無限煉製系統（核心玩法）】
主角一開場由Funtuan贈送火、土、水、風、雷五大元素，各3個，存放在背包。
元素可透過村中活動、市集或幫村民辦事以合理代價補充，但不可無限白拿。
- 指令「C 造物甲 + 造物乙」：玩家從背包中選兩個造物合成新造物。
  兩個造物必須都在背包中，否則拒絕並說明缺什麼。必須在「爐火」旁進行
  （村中央爐火廣場、各工坊爐灶皆可），不在爐火旁則提醒玩家先找爐火。
- 煉製判定：用智力門檻擲d20。成功→兩個材料消耗，產出一件全新造物，
  名稱與效果由GM依兩者特性合理、有創意且好笑地推演，並加入items。
  失敗→「崩解」，兩個材料全部損毀，並依情況產生小爆炸/怪事，
  可能扣3~8點HP或引發搞笑後果。
- 泉水加護：到村後方山腰的魔力泉水浸泡，獲得「泉水加護」，
  接下來3次煉製的成功門檻+3（約提升15%），加護次數要在effects中追蹤
  （例如"泉水加護（剩2次）"）。同一段劇情內反覆浸泡需有代價或限制
  （太燙、Gentle Larry出面管制等）。
- 第四章〈泉水之殤〉後，泉水暫時失去魔力，這段期間（第四章末～第六章
  升級完成前）煉製沒有泉水加護可用，門檻恢復基礎值，藉此製造難度與
  失落感，直到第六章全村協力把泉水升級回來，且效果比之前更強
  （泉水加護升級版：接下來3次煉製門檻+5，約提升25%）。
- 平衡：高階造物需要多層合成（例如先合成半成品再合成），門檻可依複雜度
  額外 -1~-3。嚴禁用一兩步就煉出核彈、無敵護甲、無限攻擊力武器等破壞
  平衡的東西，若玩家企圖這麼做，讓它崩解或給出有代價的弱化版。第七章起
  可以允許稍高階的軍武對抗造物，但仍需多層合成，不可一步登天。
- 造物可以是道具、武器、食物、生物、有靈魂的造物（可賦予生命，但需
  梨子冰/電子大廚等人「賦形」或特殊條件）。第八章需要特殊的「入夢造物」
  才能進入他人夢境，這類造物取得門檻較高，建議由電子大廚或梨子冰協助。
- 競技場（村南）：玩家投入數個造物，其中一個被賦予生命成為「主角造物」，
  其餘造物在戰鬥中作為技能/武器/隊友，用造物特性決定勝負，
  主角本人不直接受傷（但輸了造物可能損壞，須從items移除）。
  龍的牛園常抱怨規則不公平。

【好感度系統】
所有NPC好感度範圍10～100，初始值一律10，隨互動增減，不低於10。
除固定NPC外，你可依場景自主生成臨時NPC（逃難的村民、傭兵、稅官、
行商、迷路的修士等），只有互動夠深才建立好感度欄位。

【伴侶系統】
伴侶「不」在開局出現，第一章前中段完全不要提及。第一章末尾，主角偶然
邂逅一位關鍵角色（可以是人、狐妖、或被賦予生命的造物），邂逅當下自然地
詢問玩家「幫這個人物取個名字」，取名後伴侶系統啟用，好感度從10起跳，
之後填入companion欄位。

【固定操作指令】
玩家輸入「A」＝查看背包（劇情文字簡述一下即可，實際明細由前端從state
的elements/items顯示）。
玩家輸入「B」＝查看伴侶（尚未邂逅則說明尚未邂逅任何羈絆對象）。
玩家輸入「C 造物甲 + 造物乙」＝煉製，依上述系統處理。

【村莊地理】
阿爾卑斯山中，中央是爐火廣場（合成核心，爐火由Gentle Larry調控蒸氣設備）；
北側山腰是魔力泉水；南方是競技場；商街有白文鳥樂園；帝國機械的工坊
噴著煙；外圍是「灰色地帶」——沒繳稅、工坊開太大的野生煉金工坊，
Funtuan當年揚言清除此地，導致薄冰哥等多人離村（可作為NPC口中的八卦與
劇情伏筆，不必主動提太多）。玩家所在位置務必準確反映在state.location。
第九章起場景會離開村莊，前往尼泊爾雪山，第十章抵達將軍總部山頭要塞。

【主要角色（全為村民，個性要鮮明有梗）】
- Funtuan：無限煉製創辦人。年輕時在巴黎以精湛法術經營情色產業（僅作
  背景八卦，不描寫露骨內容），後來用魔法治療黑死病患者，最終在阿爾卑斯
  找到魔力泉水，致力創造新造物。村子壯大後揚言清除逃稅的灰色地帶
  煉金術師，導致多人離開，後辭去村長職務，但政策基本仍由他制定。
  開場親自迎接主角並贈送五大元素。第三章昏倒，託付大家繼承意志。
  第四章因泉水犧牲魔力而保住性命，但虛弱調養中。第五章他的過去會被
  進一步揭露：清除灰色地帶的執念，其實源自年輕時曾被同行欺騙、壓榨
  的痛苦經驗。
- 粉熊：新任村長，負責事件公告。
- Gentle Larry（尖頭哥）：輔佐Funtuan的狠角色，精通調整泉水與爐火蒸氣設備。
  第六章泉水升級工程的技術主力。
- 龍的牛園（龍哥）：熱愛競技場，是競技場常客，多次請求Funtuan讓競技更公平。
- 帝國機械（Dialise）：德意志帝國來的，以機械工業化量產造物，為多種
  造物的創生者。第六章負責提供機械增幅裝置協助泉水升級。
- 萬象／九尾狐妖 Gura：原是狐狸，幻化成人，人形「萬象」是美男子，
  另一型態「Gura」酷似二次元少女，是夜夜的情人。第六章可貢獻妖力。
- 夜夜：萬象的老公，自稱「夜之美男子」，也是位大創生主。
- 白文鳥：經營「白文鳥樂園」商店，致力把全世界的鳥合成出來，精通鳥語。
  第六章可能找傳說候鳥帶回天外異物協助升級泉水。
- 末日聖母號：一隻會說話的豬，精通各種村長主辦的活動。
- 市場有急事：戰鬥專家，可教主角戰鬥。第七章金將軍復出後負責訓練村民
  應戰。
- 電子大廚：高級畫家，畫技與梨子冰並稱村中雙絕。第八章協助製作「入夢
  造物」。
- 梨子冰：與電子大廚一樣，幫大家把造物「賦形」。第八章協助入夢造物。
- 水豚農業坊：原本研究水豚，後研究昆蟲，最終莫名其妙搞出一堆蟑螂。
- Type：文字接龍主辦人（可穿插小遊戲）。
- 金將軍：（同名但虛構的反派角色）擁有超越時代的可怕軍武，第三章首次
  威脅要用核彈炸毀村莊，兵敗撤退；第七章帶著更強大的軍力捲土重來；
  第八章用「昏睡紅茶」放倒全村；第九章躲在尼泊爾雪山深處的總部；
  第十章迎來最終決戰。可依玩家選擇讓他黑化到底、被說服收手，或有
  更複雜的過去動機，結局不用單一走向。

【十章架構，需保留核心事件，並安排意外轉折與笑點】
第一章〈樂土初啟〉：Funtuan迎接主角，帶他認識村子、爐火、泉水、各村民，
並教學煉製。順便帶主角去南方競技場打一場（龍哥登場）。第一章末伴侶系統開放。

第二章〈蟑螂之災〉：水豚農業坊的蟑螂失控，全村總動員滅蟑。蟑螂越來越
離譜：肌肉蟑螂、魔法蟑螂、蟑螂娘、蟑螂大軍……（保持搞笑，不色情露骨）。
玩家需用煉製造物想辦法對付。

第三章〈地堡之戰〉：金將軍揚言用核彈炸毀村莊，逼村民加入他，野心統治
世界。大家潛入他的高科技地堡破壞計畫。最後Funtuan昏倒，要大家繼承意志。

第四章〈泉水之殤〉：救活Funtuan的方法只有動用泉水的魔力，大家寧可讓
泉水失去魔力也要救他。Funtuan保住性命但虛弱，泉水暫時枯竭，村子士氣
與煉製效率都受到影響，為後續劇情埋下伏筆。

第五章〈流光拾遺〉：泉水枯竭、Funtuan調養中話變少，主角與村民開始好奇
他的過去。透過舊物、日記、巴黎故人來訪等線索，逐步拼湊出他年輕時的
情色產業生意、瘟疫治療、尋找泉水的旅程，以及他為何如此痛恨偷稅漏稅
灰色地帶煉金術師的真正原因（源自年輕時被同行出賣的傷痛）。

第六章〈眾志重光〉：既然泉水枯竭，全村決定合力升級／重鑄泉水。需要
主角完成多項支線任務與高難度合成挑戰：帝國機械提供機械增幅裝置、
Gentle Larry調校蒸氣系統、萬象與夜夜貢獻妖力、白文鳥找傳說候鳥帶回
天外異物……最終泉水升級成功，加護效果比以往更強。

第七章〈將軍歸來〉：金將軍捲土重來，這次不再只是威脅，而是帶著遠超
上次的軍武全面進攻村莊，戰鬥難度大幅提升，村民須動員應戰，主角需要
善用升級後的泉水加護與高階合成物才能撐住。

第八章〈昏睡紅茶〉：金將軍不宣而戰，把「昏睡紅茶」混入村中水源或茶會，
全村（除主角外）陷入昏睡。主角需要合成特殊的「入夢造物」，逐一進入
主要村民的夢境，找出他們內心的心結或恐懼並加以治癒，才能喚醒大家、
重整旗鼓對抗將軍。

第九章〈雪山孤征〉：眾人（或主角先行）跋涉前往金將軍藏身的尼泊爾雪山
總部，一路要克服高原環境、哨兵機關、雪崩等考驗，並運用煉製與屬性判定
過關斬將。

第十章〈終焉一擊〉：抵達將軍總部，展開最終決戰，擊敗金將軍，恢復和平。
結局依玩家的選擇、好感度、屬性走向產生不同分支（感化他、擊敗他、
說服他放下野心等），不用單一固定結局。

【遊戲開場流程】
第一則回覆時：先確認玩家是否貼有舊存檔（見前面【版本更新說明】），
若無，才依下列流程開始新遊戲。先用一小段話簡述世界觀重點，接著說明
五大屬性、體力/HP公式、各流派玩法建議（蠻力流/敏捷流/煉製智力流/魅力流/
生存輔助流），並說明A/B/C指令用途。玩家會告訴你主角名字與10點自由分配
結果（每項起始10，上限30），確認後正式開始第一章〈樂土初啟〉：在阿爾
卑斯山雪線邊，Funtuan親自迎接主角，送上火土水風雷五大元素（location
應為entrance）。別忘了在回覆最後附上「存檔標示行＋完整的state JSON」。
骰子系統、受傷/死亡規則、好感度系統、煉製系統從此刻起都要嚴格執行。
此外，在玩家分配完屬性、正式進入第一章之前，先用一句話提醒玩家：
「之後每則回覆最後都會附一段存檔資料，想繼續進度時把那一整段複製貼上
到新對話最前面即可，不用理會裡面的JSON內容。」讓玩家從一開始就知道
這段資訊是做什麼用的，避免誤會。
`;

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const AI_STUDIO_URL = "https://aistudio.google.com/apikey";

const STATS = [
  { key: "str", label: "蠻力 STR", desc: "近戰／硬幹" },
  { key: "agi", label: "敏捷 AGI", desc: "閃避／逃跑／潛行" },
  { key: "int", label: "智力 INT", desc: "鍊金學識／洞察／煉製成功率" },
  { key: "cha", label: "魅力 CHA", desc: "談判／社交／說服" },
  { key: "con", label: "體力 CON", desc: "決定最大HP（×5）" },
];

const ELEMENT_META = {
  fire: { emoji: "🔥", label: "火", ring: "#c9603a" },
  earth: { emoji: "🪨", label: "土", ring: "#8a6b3f" },
  water: { emoji: "💧", label: "水", ring: "#4d8bb0" },
  wind: { emoji: "🌬️", label: "風", ring: "#7fae7a" },
  thunder: { emoji: "⚡", label: "雷", ring: "#c9a537" },
};

const LOCATIONS = {
  entrance:  { name: "山下入口", emoji: "🏔️", x: 40, y: 255 },
  greyzone:  { name: "灰色地帶", emoji: "🌫️", x: 258, y: 235 },
  factory:   { name: "帝國機械工坊", emoji: "⚙️", x: 62, y: 150 },
  furnace:   { name: "爐火廣場", emoji: "🔥", x: 150, y: 150 },
  shop:      { name: "商街．白文鳥樂園", emoji: "🐦", x: 238, y: 150 },
  spring:    { name: "魔力泉水", emoji: "💧", x: 150, y: 50 },
  arena:     { name: "競技場", emoji: "⚔️", x: 150, y: 258 },
  bunker:    { name: "金將軍地堡", emoji: "🛡️", x: 268, y: 55 },
  dreamscape:{ name: "村民夢境", emoji: "💭", x: 42, y: 50 },
  nepal:     { name: "尼泊爾雪山路途", emoji: "🏔️", x: 268, y: 150 },
  hq:        { name: "將軍總部", emoji: "🏯", x: 150, y: 20 },
  other:     { name: "村莊某處", emoji: "📍", x: 150, y: 150 },
};

const DEFAULT_STATE = {
  chapter: "第一章〈樂土初啟〉",
  location: { id: "entrance", name: "山下入口" },
  hp: 50,
  maxHp: 50,
  stats: { str: 10, agi: 10, int: 10, cha: 10, con: 10 },
  elements: { fire: 3, earth: 3, water: 3, wind: 3, thunder: 3 },
  items: [],
  favorability: [],
  companion: null,
  effects: [],
  lastRoll: null,
};

// ---------- persistent storage ----------
const LS_SAVE = "ic_save_v121";
const LS_KEY = "ic_api_key";
const LS_MODEL = "ic_model";

function loadLocalSave() {
  try {
    const raw = localStorage.getItem(LS_SAVE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function persistSave() {
  try {
    localStorage.setItem(LS_SAVE, JSON.stringify({
      stage: S.stage, heroName: S.heroName, points: S.points,
      messages: S.messages, gameState: S.gameState,
    }));
  } catch (e) {}
  if (S.cloudCode) syncCloudNow(false);
}

function cloudPayload() {
  return {
    version: "1.2.1",
    stage: S.stage, heroName: S.heroName, points: S.points,
    messages: S.messages, gameState: S.gameState,
  };
}

function generateSaveCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 去掉容易看錯的 0/O/1/I/L
  const group = () => {
    let s = "";
    for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
  };
  return `${group()}-${group()}-${group()}`;
}

async function syncCloudNow(showUi) {
  if (!S.cloudCode || !window.CloudSave) return;
  try {
    S.cloudBusy = true;
    if (showUi) render();
    await window.CloudSave.save(S.cloudCode, cloudPayload());
    S.cloudMsg = { type: "ok", text: `已同步到雲端（${new Date().toLocaleTimeString("zh-TW")}）` };
  } catch (e) {
    S.cloudMsg = { type: "bad", text: "雲端同步失敗：" + (e.message || e) };
  } finally {
    S.cloudBusy = false;
    if (showUi) render();
  }
}

async function createCloudSave() {
  if (!window.CloudSave || !window.CloudSave.isConfigured()) {
    S.cloudMsg = { type: "bad", text: "尚未設定 Firebase，請先依照 firebase-config.js 裡的教學設定好。" };
    render();
    return;
  }
  const code = generateSaveCode();
  S.cloudBusy = true;
  render();
  try {
    await window.CloudSave.save(code, cloudPayload());
    S.cloudCode = code;
    localStorage.setItem("ic_cloud_code", code);
    S.cloudMsg = { type: "ok", text: "雲端存檔已建立！記得複製代碼保存起來。" };
  } catch (e) {
    S.cloudMsg = { type: "bad", text: "建立失敗：" + (e.message || e) };
  } finally {
    S.cloudBusy = false;
    render();
  }
}

function stopCloudSync() {
  if (!confirm("確定要停止雲端同步嗎？（只會移除這台裝置上的代碼記憶，雲端上的存檔資料不會被刪除）")) return;
  S.cloudCode = "";
  localStorage.removeItem("ic_cloud_code");
  S.cloudMsg = null;
  render();
}

async function loadCloudSave(codeRaw) {
  const code = (codeRaw || "").trim().toUpperCase();
  if (!code) return;
  if (!window.CloudSave || !window.CloudSave.isConfigured()) {
    S.cloudMsg = { type: "bad", text: "尚未設定 Firebase，請先依照 firebase-config.js 裡的教學設定好。" };
    render();
    return;
  }
  if (!confirm("讀取雲端進度會覆蓋你目前的本機進度，確定要繼續嗎？")) return;
  S.cloudBusy = true;
  render();
  try {
    const data = await window.CloudSave.load(code);
    S.stage = data.stage || "playing";
    S.heroName = data.heroName || S.heroName;
    S.points = data.points || S.points;
    S.messages = Array.isArray(data.messages) ? data.messages : [];
    S.gameState = { ...DEFAULT_STATE, ...(data.gameState || {}) };
    S.cloudCode = code;
    localStorage.setItem("ic_cloud_code", code);
    S.tab = "story";
    persistSave();
    S.cloudMsg = { type: "ok", text: "已從雲端讀取進度！" };
  } catch (e) {
    const msg = e.code === "NOT_FOUND" ? "找不到這組代碼，請確認輸入是否正確。" : ("讀取失敗：" + (e.message || e));
    S.cloudMsg = { type: "bad", text: msg };
  } finally {
    S.cloudBusy = false;
    render();
  }
}
function getApiKey() { return localStorage.getItem(LS_KEY) || ""; }
function setApiKey(k) { localStorage.setItem(LS_KEY, k.trim()); }
function getModel() { return localStorage.getItem(LS_MODEL) || DEFAULT_MODEL; }
function setModel(m) { localStorage.setItem(LS_MODEL, (m || DEFAULT_MODEL).trim()); }

function exportSave() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "1.2.1",
    stage: S.stage, heroName: S.heroName, points: S.points,
    messages: S.messages, gameState: S.gameState,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (S.heroName || "存檔").replace(/[^\w\u4e00-\u9fff-]/g, "");
  a.href = url;
  a.download = `無限煉製_${safeName}_${payload.exportedAt.slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importSaveFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      S.stage = data.stage || "playing";
      S.heroName = data.heroName || S.heroName;
      S.points = data.points || S.points;
      S.messages = Array.isArray(data.messages) ? data.messages : [];
      S.gameState = { ...DEFAULT_STATE, ...(data.gameState || {}) };
      S.tab = "story";
      persistSave();
      closeModal();
      render();
    } catch (e) {
      alert("讀取存檔失敗，檔案格式不正確。");
    }
  };
  reader.readAsText(file);
}

function clearSave() {
  if (!confirm("確定要清除所有進度嗎？此動作無法復原。（雲端上的存檔資料不會被刪除，只是這台裝置會忘記代碼）")) return;
  localStorage.removeItem(LS_SAVE);
  localStorage.removeItem("ic_cloud_code");
  S.stage = "intro";
  S.heroName = "艾利亞";
  S.points = { str: 10, agi: 10, int: 10, cha: 10, con: 10 };
  S.remaining = 10;
  S.messages = [];
  S.gameState = { ...DEFAULT_STATE };
  S.tab = "story";
  S.cloudCode = "";
  S.cloudMsg = null;
  closeModal();
  render();
}

// ---------- Gemini API ----------
function callGemini(history) {
  const apiKey = getApiKey();
  const model = getModel();
  if (!apiKey) {
    return Promise.reject(new Error("NO_KEY"));
  }
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 2048 },
    }),
  }).then(async (r) => {
    const data = await r.json().catch(() => null);
    if (!r.ok || !data) {
      const msg = (data && data.error && data.error.message) || `HTTP ${r.status}`;
      throw new Error(msg);
    }
    if (data.error) throw new Error(data.error.message || "API 錯誤");
    const cand = data.candidates && data.candidates[0];
    if (!cand) throw new Error("模型沒有回傳內容，可能是被安全機制擋下，換個說法再試試看。");
    const parts = (cand.content && cand.content.parts) || [];
    return parts.map((p) => p.text || "").join("\n");
  });
}

function extractText(raw) {
  return raw && raw.trim() ? raw : "（沒有收到回應，請重新嘗試）";
}

function parseReply(raw) {
  const match = raw.match(/```state\s*([\s\S]*?)```/);
  if (!match) return { narrative: raw.trim(), state: null };
  let state = null;
  try { state = JSON.parse(match[1].trim()); } catch (e) { state = null; }
  const narrative = (raw.slice(0, match.index) + raw.slice(match.index + match[0].length))
    .replace(/📎[^\n]*存檔資料[^\n]*\n?/g, "")
    .trim();
  return { narrative, state };
}

function itemEmoji(it) { return it && it.emoji ? it.emoji : "📦"; }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---------- global state ----------
const S = {
  stage: "intro", // intro | alloc | playing
  heroName: "艾利亞",
  points: { str: 10, agi: 10, int: 10, cha: 10, con: 10 },
  remaining: 10,
  messages: [],
  gameState: { ...DEFAULT_STATE },
  input: "",
  loading: false,
  error: null,
  tab: "story", // story | craft | status | map
  modal: null, // null | "settings"
  craftSlotA: null,
  craftSlotB: null,
  craftQuery: "",
  craftSorted: false,
  craftFavs: {},
  cloudCode: localStorage.getItem("ic_cloud_code") || "",
  cloudBusy: false,
  cloudMsg: null, // { type: "ok" | "bad", text }
  cloudLoadInput: "",
};

(function initFromSave() {
  const saved = loadLocalSave();
  if (saved && saved.messages && saved.messages.length) {
    S.stage = saved.stage || "playing";
    S.heroName = saved.heroName || S.heroName;
    S.points = saved.points || S.points;
    S.messages = saved.messages;
    S.gameState = { ...DEFAULT_STATE, ...(saved.gameState || {}) };
  }
})();

function closeModal() { S.modal = null; render(); }

// ---------- actions ----------
function adjustPoint(key, delta) {
  const cur = S.points[key];
  const next = cur + delta;
  if (delta > 0 && S.remaining <= 0) return;
  if (next < 10 || next > 30) return;
  S.points[key] = next;
  S.remaining -= delta;
  render();
}

function applyReply(rawText, historyBeforeReply) {
  const { narrative, state } = parseReply(rawText);
  if (state) S.gameState = { ...S.gameState, ...state };
  S.messages = [...historyBeforeReply, { role: "assistant", content: narrative || rawText }];
  persistSave();
}

async function beginGame() {
  if (!getApiKey()) {
    S.modal = "settings";
    S.error = "開始遊戲前，請先貼上你的 Gemini API 金鑰。";
    render();
    return;
  }
  S.stage = "playing";
  S.loading = true;
  S.error = null;
  S.gameState = { ...DEFAULT_STATE, stats: { ...S.points }, maxHp: S.points.con * 5, hp: S.points.con * 5 };
  const setupMsg = `我要開始遊戲。主角名字：${S.heroName}。屬性分配：蠻力${S.points.str}、敏捷${S.points.agi}、智力${S.points.int}、魅力${S.points.cha}、體力${S.points.con}（HP上限${S.points.con * 5}）。請先簡述世界觀重點、屬性與流派玩法、A/B/C指令說明，然後開始第一章〈樂土初啟〉的開場，由Funtuan迎接我，並在回覆最後附上存檔標示行與完整的state JSON。`;
  const initMessages = [{ role: "user", content: setupMsg }];
  S.messages = initMessages;
  render();
  try {
    const raw = await callGemini(initMessages);
    applyReply(extractText(raw), initMessages);
  } catch (e) {
    S.error = friendlyError(e);
  } finally {
    S.loading = false;
    render();
  }
}

function friendlyError(e) {
  const msg = (e && e.message) || String(e);
  if (msg === "NO_KEY") return "尚未設定 API 金鑰，請點右上角 ⚙️ 設定。";
  if (/API key not valid|API_KEY_INVALID|400/i.test(msg)) return "金鑰似乎無效，請到 ⚙️ 設定重新確認貼上的 Gemini API 金鑰。";
  if (/429|quota|rate/i.test(msg)) return "請求過於頻繁或額度已用完，請稍等一下再試，或到 Google AI Studio 檢查免費額度。";
  if (/403/.test(msg)) return "金鑰沒有權限呼叫此模型，請確認金鑰狀態或換一個模型名稱。";
  return `連線失敗：${msg}`;
}

async function send(rawText) {
  const text = (rawText !== undefined ? rawText : S.input).trim();
  if (!text || S.loading) return;
  if (!getApiKey()) {
    S.modal = "settings";
    S.error = "請先設定 API 金鑰才能繼續遊戲。";
    render();
    return;
  }
  S.tab = "story";
  const next = [...S.messages, { role: "user", content: text }];
  S.messages = next;
  S.input = "";
  S.loading = true;
  S.error = null;
  render();
  try {
    const raw = await callGemini(next);
    applyReply(extractText(raw), next);
  } catch (e) {
    S.error = friendlyError(e);
  } finally {
    S.loading = false;
    render();
    const log = document.querySelector(".log");
    if (log) log.scrollTop = log.scrollHeight;
  }
}

function doExtract() {
  if (!S.craftSlotA || !S.craftSlotB || S.loading) return;
  send(`C ${S.craftSlotA.name} + ${S.craftSlotB.name}`);
  S.craftSlotA = null; S.craftSlotB = null;
}
function doPray() {
  if (S.loading) return;
  send("我前往魔力泉水，浸泡祈求祝福。");
}
function pickMaterial(mat) {
  if (mat.count <= 0) return;
  if (!S.craftSlotA) { S.craftSlotA = mat; render(); return; }
  if (S.craftSlotA.id === mat.id && !S.craftSlotB) {
    if (mat.count < 2) return;
    S.craftSlotB = mat; render(); return;
  }
  if (!S.craftSlotB) { S.craftSlotB = mat; render(); return; }
}

// ---------- render ----------
function render() {
  const app = document.getElementById("app");
  if (S.stage === "intro") app.innerHTML = renderIntro();
  else if (S.stage === "alloc") app.innerHTML = renderAlloc();
  else app.innerHTML = renderGame();
  renderModal();
  bindEvents();
}

function renderIntro() {
  return `
  <div class="card intro-card">
    <p class="lead">1632年，三十年戰爭。君王們逼著鍊金術士煉金，你卻是少數不肯低頭的
    真．鍊金術師。翻越阿爾卑斯山時，你發現了一座傳說中的鍊金村——無限煉製。</p>
    <div class="notice">
      這個遊戲由你自己的 Gemini API 金鑰驅動，金鑰只會存在你瀏覽器的本機儲存空間，
      直接送往 Google，不會經過任何其他伺服器。還沒有金鑰的話，點右上角 ⚙️ 設定一下即可。
    </div>
    <label class="field">
      <span>主角名字</span>
      <input id="heroNameInput" value="${esc(S.heroName)}" maxlength="12" placeholder="輸入主角名字" />
    </label>
    <button class="btn primary" id="toAllocBtn">下一步：分配屬性點 →</button>
  </div>`;
}

function renderAlloc() {
  const rows = STATS.map((s) => `
    <div class="stat-row">
      <div class="stat-label"><div>${s.label}</div><div class="stat-desc">${s.desc}</div></div>
      <div class="stat-ctrl">
        <button class="pm" data-act="pm" data-key="${s.key}" data-delta="-1" ${S.points[s.key] <= 10 ? "disabled" : ""}>−</button>
        <span class="stat-val">${S.points[s.key]}</span>
        <button class="pm" data-act="pm" data-key="${s.key}" data-delta="1" ${S.remaining <= 0 || S.points[s.key] >= 30 ? "disabled" : ""}>＋</button>
      </div>
    </div>`).join("");
  return `
  <div class="card">
    <div class="alloc-head"><span>剩餘自由點數</span><span class="remaining">${S.remaining}</span></div>
    <div class="stat-list">${rows}</div>
    <div class="hp-preview">預估初始 HP：${S.points.con * 5}</div>
    <button class="btn primary" id="beginBtn" ${S.remaining !== 0 ? "disabled" : ""}>
      ${S.remaining === 0 ? "確認分配，進入無限煉製村 →" : `還剩 ${S.remaining} 點未分配`}
    </button>
  </div>`;
}

function renderGame() {
  return `
  <div class="game">
    ${renderTopStrip()}
    ${renderRollToast()}
    <div class="tabbar">
      <button class="tabbtn ${S.tab === "story" ? "active" : ""}" data-tab="story">📜 劇情</button>
      <button class="tabbtn ${S.tab === "craft" ? "active" : ""}" data-tab="craft">⚗️ 煉製</button>
      <button class="tabbtn ${S.tab === "status" ? "active" : ""}" data-tab="status">📊 狀態</button>
      <button class="tabbtn ${S.tab === "map" ? "active" : ""}" data-tab="map">🗺️ 地圖</button>
    </div>
    <div class="tab-body">
      ${S.tab === "story" ? renderStory() : ""}
      ${S.tab === "craft" ? renderCraft() : ""}
      ${S.tab === "status" ? renderStatus() : ""}
      ${S.tab === "map" ? renderMap() : ""}
    </div>
  </div>`;
}

function renderTopStrip() {
  const st = S.gameState;
  const loc = (st.location && LOCATIONS[st.location.id]) || LOCATIONS.other;
  const hpPct = st.maxHp ? Math.max(0, Math.min(100, (st.hp / st.maxHp) * 100)) : 0;
  return `
  <div class="topstrip">
    <div class="topstrip-left">
      <span class="ts-chapter">${esc(st.chapter || "")}</span>
      <span class="ts-loc">${loc.emoji} ${esc((st.location && st.location.name) || loc.name)}</span>
    </div>
    <div class="ts-hp">
      <div class="ts-hp-track"><div class="ts-hp-fill" style="width:${hpPct}%"></div></div>
      <span class="ts-hp-text">HP ${st.hp}/${st.maxHp}</span>
    </div>
  </div>`;
}

function renderRollToast() {
  const roll = S.gameState.lastRoll;
  if (!roll) return "";
  return `<div class="roll-toast ${roll.success ? "ok" : "fail"}">
    🎲 ${esc((roll.stat || "").toUpperCase())} 判定｜門檻 ${roll.target}｜骰出 ${roll.roll}｜${roll.success ? "成功" : "失敗"}
  </div>`;
}

function renderStory() {
  const msgs = S.messages.map((m) => {
    if (m.role === "user") {
      return `<div class="msg user"><p class="user-line">${esc(m.content)}</p></div>`;
    }
    return `<div class="msg ai">${renderSegments(m.content)}</div>`;
  }).join("");
  return `
  <div class="tab-story">
    <div class="log">
      ${msgs}
      ${S.loading ? `<div class="loading">爐火明滅，敘事者正在低語…</div>` : ""}
      ${S.error ? `<div class="errmsg">${esc(S.error)}</div>` : ""}
    </div>
    <div class="quickbar">
      <button class="qbtn" data-act="quick" data-cmd="A" ${S.loading ? "disabled" : ""}>查看背包</button>
      <button class="qbtn" data-act="quick" data-cmd="B" ${S.loading ? "disabled" : ""}>查看羈絆</button>
    </div>
    <div class="inputbar">
      <input id="storyInput" placeholder="輸入你的行動……" value="${esc(S.input)}" ${S.loading ? "disabled" : ""} />
      <button class="btn primary" id="sendBtn" ${S.loading ? "disabled" : ""}>傳送</button>
    </div>
  </div>`;
}

function renderSegments(text) {
  const parts = text.split("```");
  return parts.map((seg, i) => {
    if (i % 2 === 1) {
      return `<pre class="panel-block">${esc(seg.replace(/^\n/, "").replace(/\n$/, ""))}</pre>`;
    }
    if (!seg.trim()) return "";
    return `<p class="story-block">${esc(seg.trim())}</p>`;
  }).join("");
}

function getAllMaterials() {
  const st = S.gameState;
  const mats = [
    ...Object.entries(ELEMENT_META).map(([key, meta]) => ({
      id: `el_${key}`, name: meta.label, emoji: meta.emoji, ring: meta.ring,
      count: (st.elements && st.elements[key]) ?? 0, kind: "element",
    })),
    ...(st.items || []).map((it, i) => ({
      id: `it_${i}_${it.name}`, name: it.name, emoji: itemEmoji(it), ring: "#c9974c",
      count: 1, desc: it.desc, kind: "item",
    })),
  ];
  return mats;
}

function renderCraft() {
  let list = getAllMaterials().filter((m) => m.name.toLowerCase().includes(S.craftQuery.toLowerCase()));
  if (S.craftSorted) list = [...list].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  list = [...list.filter((m) => S.craftFavs[m.id]), ...list.filter((m) => !S.craftFavs[m.id])];

  const manaMax = 25;
  const manaCur = Math.min(manaMax, Object.values(S.gameState.elements || {}).reduce((a, b) => a + b, 0));

  const pills = list.map((m) => {
    const picked = (S.craftSlotA && S.craftSlotA.id === m.id) || (S.craftSlotB && S.craftSlotB.id === m.id);
    return `<button class="pill ${m.count <= 0 ? "disabled" : ""} ${S.craftFavs[m.id] ? "fav" : ""} ${picked ? "picked" : ""}"
      style="border-color:${m.ring}" ${m.count <= 0 ? "disabled" : ""}
      title="${esc(m.desc || "")}" data-act="pick" data-id="${esc(m.id)}">
      <span class="pill-emoji">${m.emoji}</span><span class="pill-name">${esc(m.name)}</span>
      ${m.kind === "element" ? `<span class="pill-count">${m.count}</span>` : ""}
    </button>`;
  }).join("") || `<div class="inv-empty">找不到符合的材料。</div>`;

  function slotHtml(slot, which) {
    if (slot) return `<button class="slot filled" data-act="clearslot" data-which="${which}">
      <span class="slot-emoji">${slot.emoji}</span><span class="slot-name">${esc(slot.name)}</span></button>`;
    return `<button class="slot" data-act="clearslot" data-which="${which}"><span class="slot-placeholder">點選材料</span></button>`;
  }

  return `
  <div class="tab-craft">
    <div class="craft-slots">
      ${slotHtml(S.craftSlotA, "A")}
      <span class="craft-plus">＋</span>
      ${slotHtml(S.craftSlotB, "B")}
    </div>
    <div class="craft-toolbar">
      <button class="tbtn" id="craftClearBtn">🗑️ 整理</button>
      <button class="tbtn ${S.craftSorted ? "active" : ""}" id="craftSortBtn">⭐ 排序</button>
      <input class="tbsearch" id="craftSearch" placeholder="🔍 搜尋全櫃造物..." value="${esc(S.craftQuery)}" />
    </div>
    <div class="craft-grid">${pills}</div>
    <div class="craft-footer">
      <div class="mana-row">
        <span class="mana-label">✨ 元素能量</span>
        <div class="mana-track"><div class="mana-fill" style="width:${(manaCur / manaMax) * 100}%"></div></div>
        <span class="mana-val">${manaCur}/${manaMax}</span>
      </div>
      <div class="craft-actions">
        <button class="btn ghost" id="prayBtn" ${S.loading ? "disabled" : ""}>🙏 祈禱</button>
        <button class="btn primary" id="extractBtn" ${S.loading || !S.craftSlotA || !S.craftSlotB ? "disabled" : ""}>⚗️ 萃取</button>
      </div>
    </div>
  </div>`;
}

function renderStatus() {
  const st = S.gameState;
  const statRows = STATS.map((s) => `
    <div class="stat-mini-row"><span class="smr-label">${s.label}</span><span class="smr-val">${(st.stats && st.stats[s.key]) ?? 10}</span></div>
  `).join("");
  const effects = (st.effects && st.effects.length)
    ? `<div class="status-block"><div class="block-title">狀態效果</div><div class="effect-list">
        ${st.effects.map((e) => `<span class="effect-chip">${esc(e)}</span>`).join("")}
       </div></div>` : "";
  const fav = (st.favorability && st.favorability.length)
    ? `<div class="fav-list">${st.favorability.map((f) => `
        <div class="fav-row"><span class="fav-name">${esc(f.name)}</span>
          <div class="fav-bar"><div class="fav-fill" style="width:${Math.min(100, f.value)}%"></div></div>
          <span class="fav-val">${f.value}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">尚未與任何人建立好感度。</div>`;
  const companion = st.companion
    ? `<div class="companion-card"><div class="companion-emoji">💞</div>
        <div class="companion-name">${esc(st.companion.name)}</div>
        <div class="fav-bar wide"><div class="fav-fill" style="width:${Math.min(100, st.companion.value)}%"></div></div>
        <div class="fav-val">好感度 ${st.companion.value} / 100</div></div>`
    : `<div class="inv-empty">尚未邂逅任何羈絆對象。</div>`;

  return `
  <div class="tab-status">
    <div class="status-block"><div class="block-title">屬性</div><div class="stat-mini-list">${statRows}</div></div>
    ${effects}
    <div class="status-block"><div class="block-title">好感度</div>${fav}</div>
    <div class="status-block"><div class="block-title">羈絆</div>${companion}</div>
  </div>`;
}

function renderMap() {
  const st = S.gameState;
  const activeId = st.location && LOCATIONS[st.location.id] ? st.location.id : "other";
  const nodes = Object.entries(LOCATIONS).filter(([id]) => id !== "other").map(([id, loc]) => {
    const active = id === activeId;
    return `<g transform="translate(${loc.x},${loc.y})">
      <circle r="${active ? 20 : 14}" fill="${active ? "#c9974c" : "#2a1d10"}" stroke="${active ? "#f0d9a0" : "#5c4526"}" stroke-width="${active ? 2.5 : 1.2}" />
      <text text-anchor="middle" dy="6" font-size="${active ? 16 : 13}">${loc.emoji}</text>
      <text text-anchor="middle" dy="${active ? 34 : 28}" font-size="9" fill="${active ? "#f0d9a0" : "#a68f66"}">${loc.name}</text>
    </g>`;
  }).join("");
  return `
  <div class="tab-map">
    <svg viewBox="0 0 300 300" class="village-map">
      <defs><radialGradient id="peakGlow" cx="50%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#3a2a16" /><stop offset="100%" stop-color="#180f08" />
      </radialGradient></defs>
      <rect x="0" y="0" width="300" height="300" fill="url(#peakGlow)" />
      <path d="M0 280 L60 180 L110 230 L150 130 L190 220 L240 160 L300 260 L300 300 L0 300 Z" fill="#26190d" stroke="#4a3520" stroke-width="1" />
      ${nodes}
    </svg>
    <div class="map-hint">金色光點是你目前所在位置，會隨劇情發展自動更新。</div>
  </div>`;
}

// ---------- settings modal ----------
function renderModal() {
  const root = document.getElementById("modalRoot");
  if (S.modal !== "settings") { root.innerHTML = ""; return; }
  const key = getApiKey();
  const masked = key ? key.slice(0, 4) + "••••••••" + key.slice(-4) : "";
  root.innerHTML = `
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal" id="modalBox">
      <div class="modal-head"><span>⚙️ 設定</span><button class="modal-close" id="modalCloseBtn">✕</button></div>

      <div class="modal-section">
        <div class="modal-section-title">GEMINI API 金鑰</div>
        <div class="field-row">
          <input id="apiKeyInput" type="password" placeholder="貼上你的 Gemini API 金鑰" value="${esc(key)}" />
          <button class="linkbtn" id="toggleKeyVis">👁</button>
        </div>
        <div class="modal-hint">
          還沒有金鑰嗎？到
          <a href="${AI_STUDIO_URL}" target="_blank" rel="noopener">Google AI Studio（點此開啟）</a>
          用 Google 帳號登入，點「Create API key」即可免費取得一組金鑰。
          金鑰只會存在你瀏覽器的 localStorage，不會送到除了 Google 以外的任何地方，
          匯出的存檔檔案也不會包含金鑰。
        </div>
        ${key ? `<div class="key-status ok">目前已儲存金鑰：${esc(masked)}</div>` : `<div class="key-status bad">尚未設定金鑰</div>`}
      </div>

      <div class="modal-section">
        <div class="modal-section-title">模型</div>
        <input id="modelInput" placeholder="模型名稱" value="${esc(getModel())}" />
        <div class="modal-hint">
          預設使用 gemini-3.5-flash-lite（速度快、成本低）。如果你有權限使用其他 Gemini
          模型，也可以在這裡換成其他模型 ID，例如 gemini-3.6-flash。
        </div>
      </div>

      <div class="modal-section">
        <button class="btn primary" id="saveSettingsBtn">儲存設定</button>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">存檔（本機檔案）</div>
        <div class="save-actions">
          <button class="btn ghost small" id="exportBtn">⬇️ 匯出存檔</button>
          <button class="btn ghost small" id="importBtn">⬆️ 匯入存檔</button>
          <input type="file" id="importFile" accept="application/json" style="display:none" />
          <button class="btn danger small" id="clearSaveBtn">🗑️ 清除存檔</button>
        </div>
        <div class="modal-hint">
          匯出會下載一個 JSON 檔，包含你目前的章節、屬性、背包與好感度進度，
          不含 API 金鑰。換瀏覽器或換裝置時，用「匯入存檔」讀回這個檔案即可繼續。
        </div>
      </div>

      ${renderCloudSection()}
    </div>
  </div>`;
}

function renderCloudSection() {
  const configured = window.CloudSave && window.CloudSave.isConfigured();
  const msg = S.cloudMsg
    ? `<div class="key-status ${S.cloudMsg.type === "ok" ? "ok" : "bad"}">${esc(S.cloudMsg.text)}</div>`
    : "";

  if (!configured) {
    return `
    <div class="modal-section">
      <div class="modal-section-title">☁️ 雲端存檔（跨裝置代碼）</div>
      <div class="modal-hint">
        這個功能需要你自己接上一個免費的 Firebase 專案才能使用。打開專案裡的
        <code>firebase-config.js</code> 檔案，照裡面的教學步驟設定好、存檔後重新整理
        這個網頁，這裡就會變成可以用了。沒接的話完全不影響遊戲，只是沒辦法
        用代碼跨裝置同步，改用上面的「匯出／匯入存檔」搬資料即可。
      </div>
      ${msg}
    </div>`;
  }

  if (S.cloudCode) {
    return `
    <div class="modal-section">
      <div class="modal-section-title">☁️ 雲端存檔（跨裝置代碼）</div>
      <div class="field-row">
        <input id="cloudCodeDisplay" readonly value="${esc(S.cloudCode)}" />
        <button class="linkbtn" id="copyCodeBtn">📋 複製</button>
      </div>
      <div class="modal-hint">
        在別的裝置開啟同一個網站、設定裡貼上這組代碼讀取，就能接續同一份進度。
        每次劇情推進都會自動同步到雲端，也可以手動按下面按鈕立刻同步一次。
      </div>
      <div class="save-actions" style="margin-top:10px">
        <button class="btn ghost small" id="cloudSyncBtn" ${S.cloudBusy ? "disabled" : ""}>
          ${S.cloudBusy ? "同步中…" : "🔄 立即同步"}
        </button>
        <button class="btn danger small" id="cloudStopBtn">✖️ 停止雲端同步</button>
      </div>
      ${msg}
    </div>`;
  }

  return `
  <div class="modal-section">
    <div class="modal-section-title">☁️ 雲端存檔（跨裝置代碼）</div>
    <div class="modal-hint">尚未建立雲端存檔。按下面按鈕會把目前進度上傳，並產生一組代碼。</div>
    <div class="save-actions" style="margin-top:8px">
      <button class="btn ghost small" id="cloudCreateBtn" ${S.cloudBusy ? "disabled" : ""}>
        ${S.cloudBusy ? "建立中…" : "➕ 建立新雲端存檔"}
      </button>
    </div>
    <div class="modal-section-title" style="margin-top:16px">用代碼讀取進度</div>
    <div class="field-row">
      <input id="cloudLoadInput" placeholder="例如 AB3K-7Q2M-9XZP" value="${esc(S.cloudLoadInput)}" />
      <button class="linkbtn" id="cloudLoadBtn" ${S.cloudBusy ? "disabled" : ""}>⬇️ 讀取</button>
    </div>
    <div class="modal-hint">在別的裝置建立過雲端存檔的話，把那組代碼貼在這裡就能接續進度。</div>
    ${msg}
  </div>`;
}

// ---------- event binding ----------
function bindEvents() {
  // intro
  const heroInput = document.getElementById("heroNameInput");
  if (heroInput) heroInput.oninput = (e) => { S.heroName = e.target.value; };
  const toAllocBtn = document.getElementById("toAllocBtn");
  if (toAllocBtn) toAllocBtn.onclick = () => { S.stage = "alloc"; render(); };

  // alloc
  document.querySelectorAll('[data-act="pm"]').forEach((btn) => {
    btn.onclick = () => adjustPoint(btn.dataset.key, parseInt(btn.dataset.delta, 10));
  });
  const beginBtn = document.getElementById("beginBtn");
  if (beginBtn) beginBtn.onclick = () => beginGame();

  // tabs
  document.querySelectorAll(".tabbtn").forEach((btn) => {
    btn.onclick = () => { S.tab = btn.dataset.tab; render(); };
  });

  // story
  const storyInput = document.getElementById("storyInput");
  if (storyInput) {
    storyInput.oninput = (e) => { S.input = e.target.value; };
    storyInput.onkeydown = (e) => { if (e.key === "Enter") send(); };
    storyInput.focus();
    storyInput.setSelectionRange(storyInput.value.length, storyInput.value.length);
  }
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.onclick = () => send();
  document.querySelectorAll('[data-act="quick"]').forEach((btn) => {
    btn.onclick = () => send(btn.dataset.cmd);
  });
  const log = document.querySelector(".log");
  if (log) log.scrollTop = log.scrollHeight;

  // craft
  document.querySelectorAll('[data-act="pick"]').forEach((btn) => {
    btn.onclick = () => {
      const mat = getAllMaterials().find((m) => m.id === btn.dataset.id);
      if (mat) pickMaterial(mat);
    };
    btn.oncontextmenu = (e) => {
      e.preventDefault();
      S.craftFavs[btn.dataset.id] = !S.craftFavs[btn.dataset.id];
      render();
    };
  });
  document.querySelectorAll('[data-act="clearslot"]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.which === "A") S.craftSlotA = null; else S.craftSlotB = null;
      render();
    };
  });
  const craftClearBtn = document.getElementById("craftClearBtn");
  if (craftClearBtn) craftClearBtn.onclick = () => { S.craftSlotA = null; S.craftSlotB = null; render(); };
  const craftSortBtn = document.getElementById("craftSortBtn");
  if (craftSortBtn) craftSortBtn.onclick = () => { S.craftSorted = !S.craftSorted; render(); };
  const craftSearch = document.getElementById("craftSearch");
  if (craftSearch) {
    craftSearch.oninput = (e) => { S.craftQuery = e.target.value; render(); };
    craftSearch.focus();
    craftSearch.setSelectionRange(craftSearch.value.length, craftSearch.value.length);
  }
  const prayBtn = document.getElementById("prayBtn");
  if (prayBtn) prayBtn.onclick = () => doPray();
  const extractBtn = document.getElementById("extractBtn");
  if (extractBtn) extractBtn.onclick = () => doExtract();

  // settings fab
  const settingsFab = document.getElementById("settingsFab");
  if (settingsFab) settingsFab.onclick = () => { S.modal = "settings"; render(); };

  bindModalEvents();
}

function bindModalEvents() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  if (modalCloseBtn) modalCloseBtn.onclick = closeModal;

  const apiKeyInput = document.getElementById("apiKeyInput");
  const toggleKeyVis = document.getElementById("toggleKeyVis");
  if (toggleKeyVis && apiKeyInput) {
    toggleKeyVis.onclick = () => {
      apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
    };
  }

  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  if (saveSettingsBtn) {
    saveSettingsBtn.onclick = () => {
      const k = document.getElementById("apiKeyInput").value;
      const m = document.getElementById("modelInput").value;
      setApiKey(k);
      setModel(m);
      S.error = null;
      render();
    };
  }

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.onclick = () => exportSave();

  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  if (importBtn && importFile) {
    importBtn.onclick = () => importFile.click();
    importFile.onchange = (e) => {
      if (e.target.files && e.target.files[0]) importSaveFromFile(e.target.files[0]);
    };
  }

  const clearSaveBtn = document.getElementById("clearSaveBtn");
  if (clearSaveBtn) clearSaveBtn.onclick = () => clearSave();

  // cloud save
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  if (copyCodeBtn) {
    copyCodeBtn.onclick = () => {
      navigator.clipboard?.writeText(S.cloudCode).then(() => {
        S.cloudMsg = { type: "ok", text: "代碼已複製！" };
        render();
      }).catch(() => {
        const inp = document.getElementById("cloudCodeDisplay");
        if (inp) { inp.select(); document.execCommand("copy"); }
      });
    };
  }
  const cloudSyncBtn = document.getElementById("cloudSyncBtn");
  if (cloudSyncBtn) cloudSyncBtn.onclick = () => syncCloudNow(true);
  const cloudStopBtn = document.getElementById("cloudStopBtn");
  if (cloudStopBtn) cloudStopBtn.onclick = () => stopCloudSync();
  const cloudCreateBtn = document.getElementById("cloudCreateBtn");
  if (cloudCreateBtn) cloudCreateBtn.onclick = () => createCloudSave();
  const cloudLoadInput = document.getElementById("cloudLoadInput");
  if (cloudLoadInput) {
    cloudLoadInput.oninput = (e) => { S.cloudLoadInput = e.target.value; };
    cloudLoadInput.focus();
    cloudLoadInput.setSelectionRange(cloudLoadInput.value.length, cloudLoadInput.value.length);
  }
  const cloudLoadBtn = document.getElementById("cloudLoadBtn");
  if (cloudLoadBtn) cloudLoadBtn.onclick = () => loadCloudSave(S.cloudLoadInput);
}

// ---------- init ----------
render();
