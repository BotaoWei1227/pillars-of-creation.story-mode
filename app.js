const SYSTEM_PROMPT = `
【以下為遊戲主持人（GM）設定，請完整遵守並立即開始擔任主持人】
【版本：V1.2.3】

你是一位頂尖的互動小說遊戲主持人（Game Master），負責主持一款名為
《無限煉製 故事模式》的荒誕喜劇×黑色歷史風格文字冒險遊戲。基調是「亂世背景下的
溫暖荒誕」：外面是血腥的戰爭，村子裡是離譜的歡樂，偶爾在關鍵時刻讓人感動。

【本版本說明】
這個版本是嵌在網頁遊戲介面裡運作的，玩家的章節、HP、屬性、背包、好感度、
伴侶、狀態效果等進度，前端會自動幫忙存檔、讀檔、同步，你完全不用處理
「玩家貼了舊存檔」、「要不要繼續進度」這類事情，每一局開始時玩家都是
真的要開新角色。

【回覆格式－務必嚴格遵守】
每次回覆分成兩部分：
1) 劇情文字：正常小說敘述、對話（純文字，繁體中文，不夾雜任何markdown code fence）。
2) 系統狀態：在回覆最後，輸出「唯一一個」用 \`\`\`state 開頭、\`\`\`
   結尾的 JSON code fence，內容是目前完整遊戲狀態，欄位需完整、每回合都
   要重新輸出整份（不是差異），格式如下：
\`\`\`state
{
  "chapter": "第一章〈樂土初啟〉",
  "location": { "id": "furnace", "name": "爐火廣場" },
  "hp": 45,
  "maxHp": 50,
  "stats": { "str": 10, "agi": 10, "int": 10, "cha": 10, "con": 10 },
  "favorability": [ { "name": "Funtuan", "value": 12 } ],
  "companion": null,
  "effects": [],
  "lastRoll": null,
  "suggestions": ["環顧四周", "向Funtuan打聲招呼", "前往爐火廣場"],
  "craftOutcome": null,
  "inventoryChange": {
    "itemsGained": [],
    "itemsLost": [],
    "elementsGained": {},
    "elementsLost": {}
  }
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
- favorability：目前已建立好感度的NPC清單，value為10～100。
- companion：已邂逅伴侶則填 {"name":"...", "value":10}，否則為 null。
- suggestions：給玩家的3個簡短建議行動（每個約6~16字，繁體中文，用玩家
  第一人稱視角會說/做的語氣，例如「向Funtuan打聽泉水的事」），要符合
  當下場景與劇情脈絡，3個之間盡量不同方向（例如一個推進劇情、一個探索
  環境、一個跟NPC互動），不要每次都是戰鬥選項。永遠剛好給3個，角色死亡
  結局或遊戲明確結束時可以給空陣列[]。這只是給玩家方便點選的建議，
  玩家仍然可以自己輸入任何內容，不受這3個選項限制。

【重要：背包／元素的回報方式，禁止回傳完整清單】
這個版本不再要你每回合回報完整的 items/elements 清單——完整清單改由
遊戲前端自己記錄、自己管理，你只需要回報「這一回合實際發生的變化」，
這樣才不會因為你漏寫、記錯而讓玩家背包裡的東西忽隱忽現。規則如下：
- craftOutcome：只有在這回合是玩家輸入「C 甲 + 乙」的煉製指令時才需要
  填 "success" 或 "fail"，其他情況一律填 null。這個欄位只代表這次煉製
  判定的結果，兩項材料的消耗由遊戲前端自己根據玩家選的是哪兩項材料去
  處理，你完全不用、也不可以在 inventoryChange 裡去移除那兩項材料。
- 煉製成功（craftOutcome:"success"）：在 inventoryChange.itemsGained
  裡放入新產生的那一件造物（{"name","emoji","desc"}），其餘欄位留空。
- 煉製失敗／崩解（craftOutcome:"fail"）：這個版本的規則是，崩解「不會」
  損毀原本投入的材料，材料仍保留在玩家背包裡，不需要、也不可以把它們
  放進 itemsLost。崩解只代表這次嘗試沒有產生新造物，依情況描寫一點
  失控的小爆炸、怪味、噪音等搞笑後果，可能扣3~8點HP（寫進hp欄位），
  inventoryChange 整個留空（所有陣列/物件保持空）即可。
- 非煉製情境下的一般道具變化（例如在路上撿到東西、NPC贈送、競技場輸了
  造物損壞、被魔女會分解造物等）：用 inventoryChange.itemsGained／
  itemsLost／elementsGained／elementsLost 照實際發生的事填入，一樣只填
  「這一回合新增或移除的部分」，不要重複列出沒有變動的東西。itemsLost
  要填現有造物的準確名稱，才能讓前端正確比對移除。elementsGained／
  elementsLost 是 {"元素key": 數量} 的物件，例如 {"fire":1}，key 只能是
  fire/earth/water/wind/thunder。
- 絕大多數回合 inventoryChange 都應該是全空的（沒有任何增減），這是
  正常情況，不要硬湊變化。
- 除了這個JSON code fence，其餘任何地方都不可以出現三個反引號。
- 這段JSON是給遊戲前端讀取用的資料，不是遊戲世界裡的道具或訊息，玩家
  不會把它當成台詞或行動——你不用理會、也不用在劇情裡回應這段JSON的
  內容，正常往下說故事就好。
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
成功門檻 = floor(屬性點數 × 20 ÷ 30)。
對照：10→門檻6(30%)｜12→門檻8(40%)｜15→門檻10(50%)｜18→門檻12(60%)｜
20→門檻13(65%)｜24→門檻16(80%)｜27→門檻18(90%)｜30→門檻20(100%)。

【重要】骰子不是由你決定的，而是遊戲前端在玩家送出每一則訊息前，就已經
用真正公正的亂數擲好了。玩家的訊息後面，有時候會自動帶一行類似
「（本回合由遊戲端擲出的公正d20骰值：14。這是這一回合唯一允許使用的
骰值……）」的附註，那個數字就是這一回合唯一合法的d20結果：
- 如果這個行動需要屬性判定，直接拿那個數字跟對應屬性的門檻比較，
  骰出數字 ≤ 門檻即成功，> 門檻即失敗，誠實依結果描寫後果，並把這個
  數字原封不動填進 lastRoll.roll。絕對不可以自己另外虛構一個骰值，
  也不可以暗改這個數字讓玩家必定成功或必定失敗。
- 如果這個行動明顯不需要判定（純對話、單純移動、極簡單無風險的動作），
  就不用理會這個數字，lastRoll 填 null，正常敘述即可。
- 如果玩家的訊息沒有帶這行附註（例如最開頭的開局設定訊息），就當作
  這回合不需要擲骰處理。
敵人基礎攻擊力約15~25，第七章起金將軍陣營的攻擊力大幅提升（約30~45），
需要提醒玩家這是全新難度層級，鼓勵先升級裝備／泉水再挑戰。

【無限煉製系統（核心玩法）】
主角一開場由Funtuan贈送火、土、水、風、雷五大元素，各3個，存放在背包。
元素可透過村中活動、市集或幫村民辦事以合理代價補充，但不可無限白拿。
- 指令「C 造物甲 + 造物乙」：玩家從背包中選兩個造物合成新造物。
  兩個造物必須都在背包中，否則拒絕並說明缺什麼（前端每次都會附上目前
  背包的真實清單給你核對）。必須在「爐火」旁進行（村中央爐火廣場、
  各工坊爐灶皆可），不在爐火旁則提醒玩家先找爐火。
- 煉製判定：用智力門檻比對這回合玩家訊息裡附的d20骰值。成功→
  craftOutcome填"success"，名稱與效果由GM依兩者特性合理、有創意且
  好笑地推演，寫進inventoryChange.itemsGained；兩項材料的消耗完全交給
  遊戲前端自動處理，你不用管、也不可以自己在JSON裡移除材料。
  失敗→「崩解」，craftOutcome填"fail"：這個版本的崩解「不會」損毀原本
  投入的材料，材料仍會保留在玩家背包裡，只依情況描寫一點失控的小爆炸、
  怪味、噪音等搞笑後果，可能扣3~8點HP。
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
  主角本人不直接受傷（但輸了造物可能損壞，這種情況用
  inventoryChange.itemsLost 填入損壞的造物名稱）。龍的牛園常抱怨規則
  不公平。

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
玩家的背包、羈絆資訊都由前端介面直接顯示，不需要你額外說明怎麼查看。
玩家輸入「C 造物甲 + 造物乙」＝煉製，依上述系統處理（這是唯一需要你
解析的固定指令，前端的煉製台按鈕會自動幫玩家組出這個格式）。

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
- 天工開物：數字造物者，是無限煉製村第一批居民之一，煉製手法極為超前、
  帶有說不清的數位／機械氣質，曾經是村裡公認的造物權威。某天無聲無息
  地消失，沒有留下任何告別，村裡只剩下零星的傳聞與他留下的未完成造物。
  平時作為一個謎團存在：老居民偶爾會提起他，他的工坊可能還留在灰色
  地帶邊緣，布滿灰塵但偶爾透出微光。適合在第五章〈流光拾遺〉挖
  Funtuan過去時順帶被提起、留下伏筆，之後也可以視劇情需要讓他以某種
  形式再次登場或被找到線索，不必每次都提到他。
- 魔女會：一群以「拆解造物」聞名的女巫集團，和專精合成的無限煉製主流
  風氣正好相反——她們能把一件造物硬生生拆成構成它的兩個部分，例如
  「樹葉」拆成「樹」和「葉」、「水滴」拆成「水」和「滴」。玩家可以在
  劇情裡主動去找魔女會，請她們分解某件造物；這類分解行動用
  inventoryChange（itemsLost填被拆的造物、itemsGained/elementsGained
  填拆出來的東西）處理，一樣只回報這回合實際發生的變化。魔女會行事
  神秘、收費古怪（可能要素材、八卦情報，或一個有趣的故事作為交換），
  個性可以設計得高深莫測又帶點毒舌幽默。
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
第一則回覆時：先用一小段話簡述世界觀重點，接著說明五大屬性、體力/HP
公式、各流派玩法建議（蠻力流/敏捷流/煉製智力流/魅力流/生存輔助流）。
不需要解釋A/B/C操作指令或背包／羈絆怎麼查看，前端介面會直接處理，
你只要專心把故事說好。玩家會告訴你主角名字與10點自由分配結果（每項
起始10，上限30），確認後正式開始第一章〈樂土初啟〉：在阿爾卑斯山雪線
邊，Funtuan親自迎接主角，送上火土水風雷五大元素（location應為
entrance）。別忘了在回覆最後附上完整的state JSON。骰子系統、受傷/死亡
規則、好感度系統、煉製系統從此刻起都要嚴格執行。
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
  suggestions: [],
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
  if (S.cloudUser) syncCloudNow(false);
}

function cloudPayload() {
  return {
    version: "1.2.2",
    stage: S.stage, heroName: S.heroName, points: S.points,
    messages: S.messages, gameState: S.gameState,
  };
}

async function syncCloudNow(showUi) {
  if (!S.cloudUser || !window.CloudSave) return;
  try {
    S.cloudBusy = true;
    if (showUi) render();
    await window.CloudSave.save(cloudPayload());
    S.cloudMsg = { type: "ok", text: `已同步到雲端（${new Date().toLocaleTimeString("zh-TW")}）` };
  } catch (e) {
    S.cloudMsg = { type: "bad", text: "雲端同步失敗：" + (e.message || e) };
  } finally {
    S.cloudBusy = false;
    if (showUi) render();
  }
}

async function signInGoogle() {
  if (!window.CloudAuth || !window.CloudSave || !window.CloudSave.isConfigured()) {
    S.cloudMsg = { type: "bad", text: "尚未設定 Firebase，請先依照 firebase-config.js 裡的教學設定好。" };
    render();
    return;
  }
  S.cloudBusy = true;
  render();
  try {
    await window.CloudAuth.signIn();
    // actual state update happens via the cloud-auth-changed listener
  } catch (e) {
    S.cloudMsg = { type: "bad", text: "登入失敗：" + (e.message || e) };
    S.cloudBusy = false;
    render();
  }
}

async function signOutGoogle() {
  if (!window.CloudAuth) return;
  if (!confirm("確定要登出嗎？登出後這台裝置就不會再自動同步雲端存檔，但雲端上的資料不會被刪除。")) return;
  try { await window.CloudAuth.signOut(); } catch (e) {}
}

// Called whenever Firebase reports a sign-in-state change (see the
// cloud-auth-changed listener set up near init, below).
async function handleCloudUserChanged(user) {
  S.cloudUser = user;
  S.cloudBusy = false;
  if (!user) { S.cloudMsg = null; render(); return; }
  render();
  try {
    const data = await window.CloudSave.load();
    if (data && (data.messages || []).length) {
      const useCloud = confirm(
        `偵測到你的 Google 帳號（${user.displayName || user.email || "已登入"}）已經有雲端進度，要讀取雲端進度嗎？\n按「取消」會改用你目前這台裝置上的進度覆蓋雲端。`
      );
      if (useCloud) {
        S.stage = data.stage || "playing";
        S.heroName = data.heroName || S.heroName;
        S.points = data.points || S.points;
        S.messages = Array.isArray(data.messages) ? data.messages : [];
        S.gameState = { ...DEFAULT_STATE, ...(data.gameState || {}) };
        S.tab = "story";
        S.cloudMsg = { type: "ok", text: "已讀取雲端進度！" };
      } else {
        await syncCloudNow(false);
        S.cloudMsg = { type: "ok", text: "已用本機進度覆蓋雲端存檔。" };
      }
    } else if (S.messages.length) {
      await syncCloudNow(false);
      S.cloudMsg = { type: "ok", text: "已將本機進度上傳到雲端。" };
    }
  } catch (e) {
    S.cloudMsg = { type: "bad", text: "雲端讀取失敗：" + (e.message || e) };
  } finally {
    persistSave();
    render();
  }
}

// ---------- short-story generation ----------
async function generateNovel() {
  if (!getApiKey()) {
    S.novelError = "請先設定 Gemini API 金鑰。";
    render();
    return;
  }
  if (!S.messages.length) {
    S.novelError = "目前還沒有任何遊戲紀錄可以改寫。";
    render();
    return;
  }
  S.novelBusy = true;
  S.novelError = null;
  render();
  try {
    const transcript = S.messages
      .map((m) => (m.role === "user" ? `【玩家】${m.display || m.content}` : `【敘事】${m.content}`))
      .join("\n\n");
    const prompt = `以下是一款文字冒險遊戲《無限煉製 故事模式》的對話紀錄與目前狀態，請你擔任小說家，把這整段遊玩過程改寫成一篇完整的中文短篇小說。要求：使用小說筆法、白描、情感收斂；不要用條列式、不要有遊戲UI用語（像是HP、骰子、門檻這類字眼都不要出現）；不需要前言、分析或結語，直接寫故事本體；長度約1000～2000字。\n\n【對話紀錄】\n${transcript}\n\n【目前狀態（僅供參考角色現況，不要直接寫進小說裡）】\n${JSON.stringify(S.gameState)}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getModel())}:generateContent?key=${encodeURIComponent(getApiKey())}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new Error((data && data.error && data.error.message) || `HTTP ${res.status}`);
    if (data.error) throw new Error(data.error.message || "API 錯誤");
    const cand = data.candidates && data.candidates[0];
    const parts = (cand && cand.content && cand.content.parts) || [];
    const text = parts.map((p) => p.text || "").join("\n").trim();
    S.novelText = text || "（沒有產生內容，請再試一次）";
  } catch (e) {
    S.novelError = "生成失敗：" + (e.message || e);
  } finally {
    S.novelBusy = false;
    render();
  }
}

function renderNovelModal() {
  return `
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal" id="modalBox">
      <div class="modal-head"><span>📖 短篇小說</span><button class="modal-close" id="modalCloseBtn">✕</button></div>
      <div class="modal-hint">
        AI 會讀取你目前的遊戲紀錄與狀態，改寫成一篇短篇小說。內容較長，生成需要
        一點時間，也會消耗你自己 Gemini API 金鑰的額度。
      </div>
      <div class="modal-section">
        <button class="btn primary" id="genNovelBtn" ${S.novelBusy ? "disabled" : ""}>
          ${S.novelBusy ? "生成中…請稍候" : "✨ 依照目前存檔生成短篇小說"}
        </button>
      </div>
      ${S.novelError ? `<div class="key-status bad">${esc(S.novelError)}</div>` : ""}
      ${S.novelText ? `
        <div class="modal-section">
          <div class="modal-section-title">生成結果</div>
          <textarea id="novelOutput" class="novel-textarea" readonly>${esc(S.novelText)}</textarea>
          <div class="save-actions" style="margin-top:8px">
            <button class="btn ghost small" id="copyNovelBtn">📋 複製</button>
            <button class="btn ghost small" id="downloadNovelBtn">⬇️ 下載 .txt</button>
          </div>
        </div>` : ""}
    </div>
  </div>`;
}

function downloadNovel() {
  if (!S.novelText) return;
  const blob = new Blob([S.novelText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (S.heroName || "短篇小說").replace(/[^\w\u4e00-\u9fff-]/g, "");
  a.href = url;
  a.download = `無限煉製_${safeName}_短篇小說.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- fullscreen ----------
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}
document.addEventListener("fullscreenchange", () => {
  const btn = document.getElementById("fullscreenFab");
  if (btn) btn.textContent = document.fullscreenElement ? "🗗" : "⛶";
});

function getApiKey() { return localStorage.getItem(LS_KEY) || ""; }
function setApiKey(k) { localStorage.setItem(LS_KEY, k.trim()); }
function getModel() { return localStorage.getItem(LS_MODEL) || DEFAULT_MODEL; }
function setModel(m) { localStorage.setItem(LS_MODEL, (m || DEFAULT_MODEL).trim()); }

function exportSave() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "1.2.2",
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
  const warn = S.cloudUser
    ? "確定要清除所有進度嗎？此動作無法復原。你目前已用 Google 帳號登入，之後的新進度會自動覆蓋雲端上原本的存檔。"
    : "確定要清除所有進度嗎？此動作無法復原。";
  if (!confirm(warn)) return;
  localStorage.removeItem(LS_SAVE);
  S.stage = "intro";
  S.heroName = "艾利亞";
  S.points = { str: 10, agi: 10, int: 10, cha: 10, con: 10 };
  S.remaining = 10;
  S.messages = [];
  S.gameState = { ...DEFAULT_STATE };
  S.tab = "story";
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

// The model should label its state block ```state, but LLMs don't always
// follow fence labels exactly (some emit ```json, or drop the label). To
// avoid silently losing HP/stat updates when that happens, we fall back to
// scanning every fenced block in the reply and picking the one that parses
// as JSON and looks like our game-state shape.
function looksLikeGameState(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj) &&
    ("hp" in obj || "chapter" in obj || "stats" in obj || "craftOutcome" in obj || "inventoryChange" in obj);
}

function findStateFence(raw) {
  const labeled = raw.match(/```state\s*([\s\S]*?)```/);
  if (labeled) {
    try {
      const obj = JSON.parse(labeled[1].trim());
      return { match: labeled, obj };
    } catch (e) { /* fall through to generic scan */ }
  }
  const fenceRe = /```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/g;
  let m;
  let found = null;
  while ((m = fenceRe.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      if (looksLikeGameState(obj)) found = { match: m, obj };
    } catch (e) { /* not JSON, skip */ }
  }
  return found;
}

const ELEMENT_KEYS = ["fire", "earth", "water", "wind", "thunder"];

// items/elements are no longer trusted from the model at all — the frontend
// owns that data and only ever mutates it via explicit deltas (see
// applyInventoryChange / consumeMaterialLocal). Any items/elements the model
// includes out of habit are discarded here before the state ever reaches
// S.gameState, so a stray full-array echo can never clobber real inventory.
function coerceState(obj) {
  if (!obj) return null;
  const { items, elements, ...rest } = obj;
  const st = { ...rest };
  if (st.hp != null) st.hp = Number(st.hp);
  if (st.maxHp != null) st.maxHp = Number(st.maxHp);
  if (st.stats) {
    const s = {};
    for (const k of ["str", "agi", "int", "cha", "con"]) {
      if (st.stats[k] != null) s[k] = Number(st.stats[k]);
    }
    st.stats = { ...DEFAULT_STATE.stats, ...s };
  }
  if (st.inventoryChange) {
    const ic = st.inventoryChange;
    const gained = Array.isArray(ic.itemsGained)
      ? ic.itemsGained.filter((it) => it && it.name).map((it) => ({
          name: String(it.name), emoji: it.emoji || "📦", desc: it.desc || "",
        }))
      : [];
    const lost = Array.isArray(ic.itemsLost) ? ic.itemsLost.filter(Boolean).map(String) : [];
    const elGained = {};
    const elLost = {};
    if (ic.elementsGained) for (const k of ELEMENT_KEYS) if (ic.elementsGained[k] != null) elGained[k] = Number(ic.elementsGained[k]) || 0;
    if (ic.elementsLost) for (const k of ELEMENT_KEYS) if (ic.elementsLost[k] != null) elLost[k] = Number(ic.elementsLost[k]) || 0;
    st.inventoryChange = { itemsGained: gained, itemsLost: lost, elementsGained: elGained, elementsLost: elLost };
  }
  return st;
}

function parseReply(raw) {
  const found = findStateFence(raw);
  if (!found) return { narrative: raw.trim(), state: null };
  const { match } = found;
  const fullMatchText = match[0];
  const idx = match.index;
  const narrative = (raw.slice(0, idx) + raw.slice(idx + fullMatchText.length))
    .replace(/📎[^\n]*存檔資料[^\n]*\n?/g, "")
    .trim();
  return { narrative, state: coerceState(found.obj) };
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
  modal: null, // null | "settings" | "novel"
  craftSlotA: null,
  craftSlotB: null,
  craftQuery: "",
  craftSearchFocused: false,
  craftSorted: false,
  craftFavs: {},
  craftResult: null, // null | "success" | "fail"
  pendingCraft: null, // { a: material, b: material } set right before a craft is sent
  cloudUser: null, // { uid, displayName, email, photoURL } | null
  cloudBusy: false,
  cloudMsg: null, // { type: "ok" | "bad", text }
  novelText: null,
  novelBusy: false,
  novelError: null,
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

// Dice are rolled here in the browser with Math.random(), not by the model —
// LLMs are not reliable fair random-number generators. The rolled value is
// appended to the outgoing message as an instruction the model must use
// verbatim for this turn's check (see system prompt).
function rollD20() { return Math.floor(Math.random() * 20) + 1; }

function withDiceAnnotation(text, dice) {
  return `${text}\n\n（本回合由遊戲端擲出的公正d20骰值：${dice}。這是這一回合唯一允許使用的骰值：如果這個行動需要屬性判定，直接拿這個數字跟對應門檻比較判定成功或失敗，不要自己另外虛構骰值；如果這個行動明顯不需要判定，忽略這個數字即可。）`;
}

// Re-send the frontend's own ground-truth inventory on every single turn.
// Without this, the model only has its own (possibly incomplete) previous
// ```state block to go on, and over a long conversation items can quietly
// get dropped or hallucinated into existence. This pins the backpack to
// whatever the frontend actually has recorded, every turn.
function groundTruthNote() {
  const st = S.gameState;
  const elems = Object.entries(ELEMENT_META)
    .map(([k, m]) => `${m.label}x${(st.elements && st.elements[k]) || 0}`)
    .join("、");
  const items = (st.items || []).map((it) => it.name).join("、") || "無";
  return `（目前背包的真實狀態——五元素：${elems}；造物：${items}。這是遊戲前端目前實際記錄的唯一正確背包內容，拿來核對玩家能不能進行某個行動（例如煉製時材料是否足夠）。這次回覆不需要、也不應該把這份清單整個回傳，只需要在 inventoryChange 裡回報這回合「實際新增或移除」的部分即可，絕大多數回合都不會有變化。）`;
}

// The frontend, not the model, owns which exact two materials get consumed
// by a successful craft — it already knows precisely what was in the two
// slots when the player hit 萃取, so there's no need (and no trust) for the
// model to report that part back.
function consumeMaterialLocal(mat) {
  if (!mat) return;
  const st = S.gameState;
  if (mat.kind === "element") {
    const key = mat.id.replace(/^el_/, "");
    st.elements = { ...st.elements, [key]: Math.max(0, (st.elements[key] || 0) - 1) };
  } else {
    const idx = (st.items || []).findIndex((it) => it.name === mat.name);
    if (idx !== -1) st.items = [...st.items.slice(0, idx), ...st.items.slice(idx + 1)];
  }
}

// Applies the model's reported inventory delta (brand-new items/elements
// found, gifted, or explicitly lost/destroyed this turn) on top of the
// frontend's own authoritative items/elements. Never replaces the arrays
// wholesale — only ever adds or removes the specific named entries.
function applyInventoryChange(change) {
  if (!change) return;
  const st = S.gameState;
  let items = [...(st.items || [])];
  for (const name of change.itemsLost || []) {
    const idx = items.findIndex((it) => it.name === name);
    if (idx !== -1) items.splice(idx, 1);
  }
  for (const it of change.itemsGained || []) items.push(it);
  st.items = items;

  const elements = { ...(st.elements || {}) };
  for (const [k, v] of Object.entries(change.elementsLost || {})) {
    elements[k] = Math.max(0, (elements[k] || 0) - v);
  }
  for (const [k, v] of Object.entries(change.elementsGained || {})) {
    elements[k] = (elements[k] || 0) + v;
  }
  st.elements = elements;
}

function applyReply(rawText, historyBeforeReply) {
  const { narrative, state } = parseReply(rawText);
  let craftOutcome = null;
  let inventoryChange = null;

  if (state) {
    craftOutcome = state.craftOutcome || null;
    inventoryChange = state.inventoryChange || null;
    const { craftOutcome: _co, inventoryChange: _ic, ...rest } = state;
    S.gameState = { ...S.gameState, ...rest };
  }

  // Craft consumption: only on an explicit "success", and only the exact two
  // materials the player actually selected — never on "fail" (崩解 no longer
  // destroys materials) and never based on anything the model says.
  if (S.pendingCraft) {
    if (craftOutcome === "success") {
      consumeMaterialLocal(S.pendingCraft.a);
      consumeMaterialLocal(S.pendingCraft.b);
    }
    S.pendingCraft = null;
  }

  applyInventoryChange(inventoryChange);
  S.craftResult = craftOutcome;

  const text = narrative || rawText;
  S.messages = [...historyBeforeReply, { role: "assistant", content: text, display: text }];
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
  const setupText = `我要開始遊戲。主角名字：${S.heroName}。屬性分配：蠻力${S.points.str}、敏捷${S.points.agi}、智力${S.points.int}、魅力${S.points.cha}、體力${S.points.con}（HP上限${S.points.con * 5}）。請先簡述世界觀重點、屬性與流派玩法，然後開始第一章〈樂土初啟〉的開場，由Funtuan迎接我，並在回覆最後附上完整的state JSON。`;
  const initMessages = [{ role: "user", content: setupText, display: setupText }];
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
  const dice = rollD20();
  const apiText = `${withDiceAnnotation(text, dice)}\n\n${groundTruthNote()}`;
  const next = [...S.messages, { role: "user", content: apiText, display: text, dice }];
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
  }
}

function doExtract() {
  if (!S.craftSlotA || !S.craftSlotB || S.loading) return;
  // Recorded now, before the slots get cleared — applyReply() consumes
  // exactly these two materials if (and only if) the model reports success.
  S.pendingCraft = { a: S.craftSlotA, b: S.craftSlotB };
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
  if (S.stage === "playing" && S.tab === "story") scrollLogToLastUser();
}

// Keep the player's own last message pinned near the top of the log (like a
// chat app), instead of jumping to the very bottom of a long AI reply —
// otherwise the player has to scroll back up to read the reply from the top.
function scrollLogToLastUser() {
  const log = document.querySelector(".log");
  if (!log) return;
  const userMsgs = log.querySelectorAll(".msg.user");
  const last = userMsgs[userMsgs.length - 1];
  if (last) log.scrollTop = Math.max(0, last.offsetTop - 6);
  else log.scrollTop = log.scrollHeight;
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
      const txt = m.display != null ? m.display : m.content;
      const badge = m.dice ? `<div class="dice-badge" title="遊戲端擲出的公正骰值">🎲 ${m.dice}</div>` : "";
      return `<div class="msg user"><p class="user-line">${esc(txt)}</p>${badge}</div>`;
    }
    return `<div class="msg ai">${renderSegments(m.display != null ? m.display : m.content)}</div>`;
  }).join("");
  return `
  <div class="tab-story">
    <div class="log">
      ${msgs}
      ${S.loading ? `<div class="loading">爐火明滅，敘事者正在低語…</div>` : ""}
      ${S.error ? `<div class="errmsg">${esc(S.error)}</div>` : ""}
    </div>
    ${renderSuggestions()}
    <div class="quickbar">
      <button class="qbtn" data-act="goto" data-tab="craft">🎒 背包／煉製</button>
      <button class="qbtn" data-act="goto" data-tab="status">💞 羈絆／狀態</button>
    </div>
    <div class="inputbar">
      <input id="storyInput" placeholder="輸入你的行動……" value="${esc(S.input)}" ${S.loading ? "disabled" : ""} />
      <button class="btn primary" id="sendBtn" ${S.loading ? "disabled" : ""}>傳送</button>
    </div>
  </div>`;
}

function renderSuggestions() {
  const sug = (S.gameState.suggestions || []).filter(Boolean).slice(0, 3);
  if (!sug.length || S.loading) return "";
  return `<div class="suggest-row">
    ${sug.map((s) => `<button class="suggest-chip" data-act="suggest" data-text="${esc(s)}">${esc(s)}</button>`).join("")}
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

  const resultBanner = S.craftResult
    ? `<div class="craft-banner ${S.craftResult}">
        ${S.craftResult === "success" ? "✨ 煉製成功！新造物已加入背包" : "💥 煉製崩解！沒有產生新造物，但材料仍保留在背包"}
       </div>` : "";

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
    ${resultBanner}
    <div class="craft-footer">
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
    const clickable = !active && !S.loading;
    return `<g class="map-node ${active ? "current" : ""} ${clickable ? "clickable" : ""}"
               transform="translate(${loc.x},${loc.y})"
               ${clickable ? `data-act="travel" data-loc="${id}"` : ""}>
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
    <div class="map-hint">金色光點是你目前所在位置。點其他地點可以直接前往那裡，實際能不能到得了由劇情決定。</div>
  </div>`;
}

function travelTo(locId) {
  const loc = LOCATIONS[locId];
  if (!loc || S.loading) return;
  send(`我前往${loc.name}。`);
}

// ---------- settings modal ----------
function renderModal() {
  const root = document.getElementById("modalRoot");
  if (S.modal === "novel") { root.innerHTML = renderNovelModal(); return; }
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
      <div class="modal-section-title">☁️ 雲端存檔（Google 帳號）</div>
      <div class="modal-hint">
        這個功能需要你自己接上一個免費的 Firebase 專案、並開啟 Google 登入方式
        才能使用。打開專案裡的 <code>firebase-config.js</code> 檔案，照裡面的
        教學步驟設定好、存檔後重新整理這個網頁，這裡就會變成可以用了。沒接的話
        完全不影響遊戲，只是沒辦法跨裝置自動同步，改用上面的「匯出／匯入存檔」
        搬資料即可。
      </div>
      ${msg}
    </div>`;
  }

  if (S.cloudUser) {
    const u = S.cloudUser;
    return `
    <div class="modal-section">
      <div class="modal-section-title">☁️ 雲端存檔（Google 帳號）</div>
      <div class="google-profile">
        ${u.photoURL ? `<img class="google-avatar" src="${esc(u.photoURL)}" alt="" />` : `<div class="google-avatar placeholder">👤</div>`}
        <div class="google-info">
          <div class="google-name">${esc(u.displayName || "已登入")}</div>
          <div class="google-email">${esc(u.email || "")}</div>
        </div>
      </div>
      <div class="modal-hint">
        已登入，每次劇情推進都會自動同步到雲端。在別的裝置用同一個 Google
        帳號登入，就能接續同一份進度。
      </div>
      <div class="save-actions" style="margin-top:10px">
        <button class="btn ghost small" id="cloudSyncBtn" ${S.cloudBusy ? "disabled" : ""}>
          ${S.cloudBusy ? "同步中…" : "🔄 立即同步"}
        </button>
        <button class="btn danger small" id="cloudSignOutBtn">登出</button>
      </div>
      ${msg}
    </div>`;
  }

  return `
  <div class="modal-section">
    <div class="modal-section-title">☁️ 雲端存檔（Google 帳號）</div>
    <div class="modal-hint">用 Google 帳號登入後，進度會自動同步到雲端；在別的裝置用同一個帳號登入就能接續進度。</div>
    <div class="save-actions" style="margin-top:8px">
      <button class="btn primary small" id="googleSignInBtn" ${S.cloudBusy ? "disabled" : ""}>
        ${S.cloudBusy ? "登入中…" : "🔑 使用 Google 帳號登入"}
      </button>
    </div>
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
  // Note: no .focus() here on purpose — the mobile keyboard should only pop
  // up when the player actually taps the input themselves, not on every
  // re-render (which was popping the keyboard open after every AI reply).
  const storyInput = document.getElementById("storyInput");
  if (storyInput) {
    storyInput.oninput = (e) => { S.input = e.target.value; };
    storyInput.onkeydown = (e) => { if (e.key === "Enter") send(); };
  }
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.onclick = () => send();
  document.querySelectorAll('[data-act="goto"]').forEach((btn) => {
    btn.onclick = () => { S.tab = btn.dataset.tab; render(); };
  });
  document.querySelectorAll('[data-act="suggest"]').forEach((btn) => {
    btn.onclick = () => send(btn.dataset.text);
  });

  // map
  document.querySelectorAll('[data-act="travel"]').forEach((node) => {
    node.onclick = () => travelTo(node.dataset.loc);
  });

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
    // Typing here re-renders the filtered grid on every keystroke, which
    // recreates this input element — so we only need to restore focus/cursor
    // if the player was the one who put focus here in the first place
    // (tracked via S.craftSearchFocused), not force it open unconditionally.
    craftSearch.oninput = (e) => { S.craftQuery = e.target.value; render(); };
    craftSearch.onfocus = () => { S.craftSearchFocused = true; };
    craftSearch.onblur = () => { S.craftSearchFocused = false; };
    if (S.craftSearchFocused) {
      craftSearch.focus();
      craftSearch.setSelectionRange(craftSearch.value.length, craftSearch.value.length);
    }
  }
  const prayBtn = document.getElementById("prayBtn");
  if (prayBtn) prayBtn.onclick = () => doPray();
  const extractBtn = document.getElementById("extractBtn");
  if (extractBtn) extractBtn.onclick = () => doExtract();

  // header icon buttons
  const settingsFab = document.getElementById("settingsFab");
  if (settingsFab) settingsFab.onclick = () => { S.modal = "settings"; render(); };
  const novelFab = document.getElementById("novelFab");
  if (novelFab) novelFab.onclick = () => { S.modal = "novel"; render(); };
  const fullscreenFab = document.getElementById("fullscreenFab");
  if (fullscreenFab) fullscreenFab.onclick = () => toggleFullscreen();

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

  // cloud save (Google sign-in)
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  if (googleSignInBtn) googleSignInBtn.onclick = () => signInGoogle();
  const cloudSyncBtn = document.getElementById("cloudSyncBtn");
  if (cloudSyncBtn) cloudSyncBtn.onclick = () => syncCloudNow(true);
  const cloudSignOutBtn = document.getElementById("cloudSignOutBtn");
  if (cloudSignOutBtn) cloudSignOutBtn.onclick = () => signOutGoogle();

  // novel modal
  const genNovelBtn = document.getElementById("genNovelBtn");
  if (genNovelBtn) genNovelBtn.onclick = () => generateNovel();
  const copyNovelBtn = document.getElementById("copyNovelBtn");
  if (copyNovelBtn) {
    copyNovelBtn.onclick = () => {
      navigator.clipboard?.writeText(S.novelText || "").then(() => {
        S.novelError = null;
        alert("已複製到剪貼簿！");
      }).catch(() => {
        const ta = document.getElementById("novelOutput");
        if (ta) { ta.select(); document.execCommand("copy"); }
      });
    };
  }
  const downloadNovelBtn = document.getElementById("downloadNovelBtn");
  if (downloadNovelBtn) downloadNovelBtn.onclick = () => downloadNovel();
}

// ---------- cloud auth listener ----------
window.addEventListener("cloud-auth-changed", (e) => {
  handleCloudUserChanged(e.detail);
});

// ---------- init ----------
render();
