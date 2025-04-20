<template>
    <v-container fluid>
    <h1 class="header">Selected Book: {{ route.params.book }}</h1>
    <v-row>
      <v-col cols="12" md="6" class="scrollable">
        <div 
          id="TEI" 
          style="
            overflow: auto; 
            max-height: 800px;
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 20px;
            "
          >
          </div>
        <!--textsの要素ごとに表示-->
        <!--
        <v-card v-for="text in texts" :key="text.line">
          <v-card-title 
            v-if="text.commentary.length > 0"
            @click="textClicked(text.commentary)"
            style="
              color: blue;
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 14px;
              "
            >
            {{ text.line }}
          </v-card-title>
          <v-card-title 
            v-else
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 14px;
              "
            >
            {{ text.line }}
          </v-card-title>
          <v-card-text
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 20px;
              "
          >{{ text.description }}</v-card-text>
        </v-card>
      -->
      </v-col>
      <v-col id="commentary_container" cols="12" md="6" class="scrollable">
        <!--commentary_listが存在する場合には、commentary_list内のcommentaryをループ処理-->
        <!--
        <div v-if="commentary_list && commentary_list.length > 0">
          <v-card 
            v-for="commentary in commentary_list" 
            :key="commentary.description"
            style="
              overflow: visible;
              margin-bottom: 20px;
              border-width: 2px;
              "
            >
            <v-card-title
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 24px;
              "
            >
              <p>{{commentary.annotator}}: </p>
              <p>{{commentary.work}}:{{commentary.book}}</p>
            </v-card-title>

            <div id="Commentary_TEI" style="
              margin-left: 20px;
              margin-right: 20px;
              overflow: auto; 
              max-height: 500px;
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 20px;
              "/>
            <div class="action-container">
            <treeselect
              :multiple="false"
              :options="options"
              placeholder="Select a language"
              v-model="lang"
              menu-placement="top"
              class="mb-4 treeselect"
              style="
                font-size: 18px;
                margin-top: 15px;
                margin-bottom: 10px;
                margin-left: 20px;
                width: 200px;
                bottom: 100% !important; /* 選択肢を入力欄の上に表示 */
              "
            />
            <v-btn
              color="primary"
              @click="commentaryTranslate(commentary.content)"
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 18px;
                margin-top: 15px;
                margin-bottom: 15px;
                margin-left: 20px;
              "
            >
              Translation
            </v-btn>
            <v-btn
              color="primary"
              @click="commentarySummarize(commentary.content)"
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 18px;
                margin-top: 15px;
                margin-bottom: 15px;
                margin-left: 10px;
              "
            >
              Summary
            </v-btn>
          </div>
          </v-card>
      </div>
      <div v-else>
        <v-card>
          <v-card-title
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 24px;
            "
          >
            Commentary
          </v-card-title>
          <v-card-text
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 18px;
            "
          >
            No commentary available.
          </v-card-text>
        </v-card>
      </div>
      -->
      </v-col>
    </v-row>

    <v-dialog v-model="isTransSummDialogOpen" max-width="600px">
      <v-card :draggable="true">
        <v-card-title class="headline">Translation/Summary</v-card-title>
        <v-card-text>
              <p>{{ processedText }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="isTransSummDialogOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleGenAI } from "@google/genai";
import CETEI from "CETEIcean";

import Treeselect from "vue3-treeselect";
import "vue3-treeselect/dist/vue3-treeselect.css";

const genAI = new GoogleGenAI({
        //apiKey: process.env.GOOGLE_GENAI_API_KEY
        apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY // 環境変数から API キーを読み込む
      });

export default {
  components: {
    Treeselect
  },
  setup() {
    //const works = ref(["Politics", "Metaphysics", "De Bello Gallico"]);
    const route = useRoute();
    const router = useRouter();
    const texts = ref([]);
    const textCommentaryPair = ref([]);
    const commentary = ref('');
    const commentaryContent = ref('');
    const commentaryAuthor = ref('');
    const commentaryWork = ref('');
    const commentary_list = ref([]);

    const teiContent = ref('');

    const lang = ref('Japanese');

    const options = ref([
      { id: 'Japanese', label: 'Japanese' },
      { id: 'English', label: 'English' },
      { id: 'French', label: 'French' },
      { id: 'Chinese', label: 'Chinese' },
      { id: 'Spanish', label: 'Spanish' },
      { id: 'Italian', label: 'Italian' },
      { id: 'German', label: 'German' },
      { id: 'Russian', label: 'Russian' },
      { id: 'Greek', label: 'Greek' },
      { id: 'Latin', label: 'Latin' }
    ]);

    const processedText = ref('');
    const isTransSummDialogOpen = ref(false);

    //const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?text ?line  ?commentary WHERE {
          ?author a <http://example.org/vocabulary/Author> ;
                  rdfs:label "${route.params.author}" .
          ?work a <http://example.org/vocabulary/Work> ;
                  rdfs:label "${route.params.work}" ;
                  <http://purl.org/dc/elements/1.1/creator> ?author .
          ?text a <http://example.org/vocabulary/Text>;
              <http://example.org/vocabulary/correspondingWork> ?work ;
              <http://example.org/vocabulary/correspondingBook> "${route.params.book}" ;
              <http://purl.org/dc/elements/1.1/creator> ?author.
          ?text <http://example.org/vocabulary/correspondingSeg> ?line .

          OPTIONAL{?commentary <http://example.org/vocabulary/references> ?text}
        }
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.bindings.forEach((binding) => {

          //dts apiを使用して、texts.value.descriptionにテクストを追加
          const url = `https://humanitext-dts.vercel.app/api/dts/document?id=urn:${route.params.author}.${route.params.work}:${route.params.book}&ref=${binding.line.value}`;
          //console.log(url);
          // urlで問い合わせてデータを取得

          //もし既存のtexts.valueに含まれる連想配列にlineが存在すれば、その連想配列にcommentaryを追加
          const existingText = texts.value.find((text) => text.line === binding.line.value);
          console.log(existingText);
          if (existingText) {
            existingText.commentary.push(binding.commentary ? binding.commentary.value : null);
            //変更を反映してtexts.valueを更新
            texts.value = [...texts.value];
          } else {
            //console.log("no existing text");
            texts.value.push({
            line: binding.line.value,
            //description: binding.description.value,
            //もしcommentaryが存在すれば新たに連想配列を作成し、texts.valueに追加
            commentary: binding.commentary ? [binding.commentary.value] : []
          });
        };
        });
      });

    console.log(texts.value);
    // 現状では、一つの行に対して複数の注釈が存在する場合、インターフェイス上では同じ行が複数回表示されてしまう

    const xml_path = `https://humanitext-dts-data.vercel.app/xml/${route.params.author}/${route.params.work}/${route.params.book}.xml`;
    console.log(xml_path);
    // xmlデータを取得
    var CETEIcean = new CETEI()
    /*
    let behaviors = {
      "tei": {
        "seg": (element) => {
          // <seg> 要素の xml:id を取得
          const xmlId = element.getAttribute('xml:id');
          if (xmlId) {
            // xml:id の値をテキストノードとして作成
            const idText = document.createTextNode(`[${xmlId}] `);
            // <seg> 要素の前に挿入
            element.parentNode.insertBefore(idText, element);
          }
        }
      }
    };
    */
    let text_behaviors = {
      "tei": {
        "seg": (element) => {
          // <seg> 要素の xml:id を取得
          const xmlId = element.getAttribute('xml:id');
          if (xmlId) {
            // xml:id の値を表示するための <span> 要素を作成
            const idSpan = document.createElement("span");
            idSpan.textContent = `[${xmlId}] `;
            idSpan.style.color = "blue"; // フォント色を青に設定
            idSpan.style.cursor = "pointer"; // ポインタを表示
            idSpan.style.fontSize = "14px"; // フォントサイズを小さく設定

            // <seg> 要素の前に <span> を挿入
            element.parentNode.insertBefore(idSpan, element);

            // クリックイベントを追加
            idSpan.addEventListener("click", () => {
              textClicked(xmlId);
            });
              
          }
        }
      }
    };

    CETEIcean.addBehaviors(text_behaviors);
    CETEIcean.getHTML5(xml_path, function(data) {
      //console.log(data);
      // xml:idがroute.params.bookの要素を取得
      const body = data.getElementById(route.params.book);
      console.log(body);
      document.getElementById("TEI").appendChild(body)
    })

    const textClicked = (xmlId) => {
      console.log(xmlId);
      const matchingText = texts.value.find((text) => text.line === xmlId);

      commentary_list.value = []; // commentary_listを初期化

      // containerという要素を取得
      const container = document.getElementById("commentary_container");

      // container内のすべての子要素を削除
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      if (matchingText.commentary && matchingText.commentary.length > 0) {
        console.log(matchingText.commentary)

        //const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
        const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";

        // containerという要素を生成
        const container = document.getElementById("commentary_container");

        for (const commentary of matchingText.commentary) {

          var c = new CETEI()

          const query = `
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

              SELECT DISTINCT ?seg ?annotator ?work ?book WHERE {
              <${commentary}> <http://purl.org/dc/elements/1.1/creator> ?annotator_uri ;
                <http://example.org/vocabulary/correspondingSeg> ?seg;
                <http://example.org/vocabulary/correspondingWork> ?work_uri ;
                <http://example.org/vocabulary/correspondingBook> ?book .
                ?annotator_uri rdfs:label ?annotator .
                ?work_uri rdfs:label ?work .
              }
          `;
          const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
          fetch(url)
            .then(res => res.json())
            .then(data => {
              //console.log(data);

              data.results.bindings.forEach((binding) => {
                //const dts_api = `https://humanitext-dts.vercel.app/api/dts/document?id=urn:${binding.annotator.value}.${binding.work.value}:${binding.book.value}&ref=${binding.seg.value}`;
                const dts_api = `api/dts/document?id=urn:${binding.annotator.value}.${binding.work.value}:${binding.book.value}&ref=${binding.seg.value}`;
                console.log(dts_api);
                const dts_data = fetch(dts_api)
                console.log(dts_data);
                c.getHTML5(dts_api, function(data) {
                //c.getHTML5(`/api/dts/document?id=urn:${binding.annotator.value}.${binding.work.value}:${binding.book.value}&ref=${binding.seg.value}`, function (data) {
                  //console.log(data);
                  // xml:idがroute.params.bookの要素を取得
                  const body = data.getElementById(binding.seg.value);
                  
                  const stringBody = body.innerHTML;
                  console.log(stringBody);
                  teiContent.value = stringBody;
                  console.log(body);
                  //document.getElementById("Commentary_TEI").appendChild(body)
                  // cardを作成
                  const card = document.createElement("div");
                  card.style.marginBottom = "20px";
                  card.style.border = "1px solid #ccc";
                  // card titleを作成し、cardに追加
                  const cardTitle = document.createElement("h2");
                  cardTitle.textContent = `${binding.annotator.value}: ${binding.work.value}:${binding.book.value}`;
                  cardTitle.style.fontFamily = "Georgia, 'Times New Roman', Times, serif";
                  cardTitle.style.fontSize = "24px";
                  cardTitle.style.marginTop = "10px";
                  cardTitle.style.marginBottom = "10px";
                  cardTitle.style.marginLeft = "20px";
                  cardTitle.style.marginRight = "20px";
                  card.appendChild(cardTitle);
                  // card bodyを作成し、cardに追加
                  const cardBody = document.createElement("div");
                  cardBody.appendChild(body);
                  cardBody.style.fontFamily = "Georgia, 'Times New Roman', Times, serif";
                  cardBody.style.fontSize = "20px";
                  cardBody.style.overflow = "auto";
                  cardBody.style.maxHeight = "500px";
                  cardBody.style.marginLeft = "20px";
                  cardBody.style.marginRight = "20px";
                  cardBody.style.marginBottom = "20px";
                  cardBody.style.padding = "10px";
                  cardBody.style.borderRadius = "5px";
                  card.appendChild(cardBody);
                  // card footerを作成し、cardに追加
                  const cardFooter = document.createElement("div");
                  // 言語選択肢を作成
                  const langSelect = document.createElement("select");
                  options.value.forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option.id;
                    opt.textContent = option.label;
                    langSelect.appendChild(opt);
                  });
                  langSelect.value = lang.value;
                  langSelect.style.fontSize = "18px";
                  langSelect.style.marginTop = "15px";
                  langSelect.style.marginBottom = "15px";
                  langSelect.style.marginLeft = "20px";
                  langSelect.style.marginRight = "20px";
                  langSelect.style.padding = "10px"; // 内側の余白を追加
                  langSelect.style.border = "2px solid #ccc"; // 枠線を追加
                  langSelect.style.borderRadius = "5px"; // 角を丸くする
                  langSelect.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)"; // ボックスシャドウを追加
                  langSelect.style.cursor = "pointer"; // ポインタを表示
                  langSelect.addEventListener("change", (event) => {
                    lang.value = event.target.value;
                  });
                  cardFooter.appendChild(langSelect);
                  // 翻訳ボタンを作成し、cardに追加
                  const translateButton = document.createElement("button");
                  translateButton.textContent = "Translation";
                  translateButton.style.fontFamily = "Georgia, 'Times New Roman', Times, serif";
                  translateButton.style.fontSize = "18px";
                  translateButton.style.backgroundColor = "#4CAF50"; // 緑色
                  translateButton.style.color = "white"; // 白色
                  translateButton.style.border = "none"; // 枠線なし
                  translateButton.style.padding = "10px 20px"; // 内側の余白
                  translateButton.style.borderRadius = "5px"; // 角を丸くする
                  translateButton.style.marginTop = "15px";
                  translateButton.style.marginBottom = "15px";
                  translateButton.style.marginLeft = "20px";
                  translateButton.style.marginRight = "20px";
                  translateButton.style.cursor = "pointer"; // ポインタを表示
                  translateButton.addEventListener("click", () => {
                    commentaryTranslate(stringBody);
                  });
                  cardFooter.appendChild(translateButton);
                  // 要約ボタンを作成し、cardに追加
                  const summarizeButton = document.createElement("button");
                  summarizeButton.textContent = "Summary";
                  summarizeButton.style.fontFamily = "Georgia, 'Times New Roman', Times, serif";
                  summarizeButton.style.fontSize = "18px";
                  summarizeButton.style.backgroundColor = "#4CAF50"; // 緑色
                  summarizeButton.style.color = "white"; // 白色
                  summarizeButton.style.border = "none"; // 枠線なし
                  summarizeButton.style.padding = "10px 20px"; // 内側の余白
                  summarizeButton.style.borderRadius = "5px"; // 角を丸くする
                  summarizeButton.style.marginTop = "15px";
                  summarizeButton.style.marginBottom = "15px";
                  summarizeButton.style.marginLeft = "20px";
                  summarizeButton.style.marginRight = "20px";
                  summarizeButton.addEventListener("click", () => {
                    commentarySummarize(stringBody);
                  });
                  cardFooter.appendChild(summarizeButton);
                  card.appendChild(cardFooter);

                  container.appendChild(card);
                })
                
                commentary_list.value.push({
                  //description: binding.description.value,
                  annotator: binding.annotator.value,
                  book: binding.book.value,
                  work: binding.work.value,
                  content: teiContent.value
                });
                //commentaryContent.value = binding.description.value;
                //commentaryAuthor.value = binding.annotator.value;
                //commentaryWork.value = binding.book.value;
              });
            });
        }
      };
      
    };  

    // Google GenAIによる処理
    const LLMProcess = async (text, mode) => {
      try {
        let prompt = '';
        if (mode === "translate") {
          prompt = `Translate the following text to ${lang.value}: ${text}`;
        } else if (mode === "summarize") {
          prompt = `Briefly summarize the following text in ${lang.value}: ${text}`;
        }

        const response = await genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          temperature: 0.5
        });

        if (!response || !response.text) {
          throw new Error("No response from the API");
        }

        return response.text;
      } catch (error) {
        console.error("Error in LLMProcess:", error);
        alert("Failed to process the text. Please try again.");
        return '';
      }
    };

    // コメンタリーの内容を翻訳する
    const commentaryTranslate = (commentaryDesc) => {
      console.log(commentaryDesc);
      LLMProcess(commentaryDesc, "translate").then((translatedText) => {
        //console.log(translatedText);
        if (translatedText) {
          processedText.value = translatedText;
          isTransSummDialogOpen.value = true; // ダイアログを開く
        }
        console.log(isTransSummDialogOpen.value);
        console.log(processedText.value);
      });
    };

    // コメンタリーの内容を要約する
    const commentarySummarize = (commentaryDesc) => {
      console.log(commentaryDesc);
      LLMProcess(commentaryDesc, "summarize").then((summarizedText) => {
        //console.log(summarizedText);
        if (summarizedText) {
          processedText.value = summarizedText;
          isTransSummDialogOpen.value = true; // ダイアログを開く
        }
        console.log(processedText.value);
        console.log(isTransSummDialogOpen.value);
      });
    }

    return {
      options,
      lang,
      route,
      texts,
      //commentary,
      //commentaryContent,
      //commentaryAuthor,
      //commentaryWork,
      textClicked,
      commentaryTranslate,
      commentarySummarize,
      commentary_list,
      processedText,
      isTransSummDialogOpen,
      LLMProcess,
    };
  }

};
</script>

<style scoped>
/*@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Greek&display=swap');*/
.greek-text {
  /*font-family: 'Noto Sans Greek', sans-serif;*/
  font-family: 'Georgia', serif;
}
.scrollable {
  margin-top: 10px;
  max-height: 800px; /* 必要に応じて高さを調整 */
  overflow-y: auto;
}
.selectTheme {
  color: black;
  font-size: 24px;
  text-align: left;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.header {
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.action-container {
  display: flex;
  align-items: center;
  gap: 5px; /* 要素間のスペース */
}
.treeselect {
  position: relative;
}

.treeselect__menu {
  position: absolute !important;
  bottom: 100% !important; /* 選択肢を入力欄の上に表示 */
  left: 0;
  z-index: 9999 !important; /* 他の要素に隠れないように調整 */
}
tei-seg:before {
  white-space: pre;
  content: "\A";
}
</style>