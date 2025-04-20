<template>
  <!--
    <v-app>
      <v-content>
      <v-container fluid class="help-main">
        <h3 class="help-content">エディタの利用方法を解説する動画を公開予定。<br/>開発者：小川潤（国立情報学研究所）・中村覚（東京大学史料編纂所）</h3>
      </v-container>
      </v-content>
    </v-app>
    -->
  <v-app>
    <v-container>
      <div class="main-container">
        <p>原典と注釈を対応参照するためのアプリケーションです。
        </p>
      </div>
    </v-container>
  </v-app>
</template>
<style>
/*
.help-main {
  text-align: center;
}
.help-content {
  text-align: left;
}
*/
.main-container {
  /*max-width: 1200px;*/
  color: #666;
  margin: 20px auto;
  padding: 20px;
  font-weight: bold;
}

.blog-list {
  margin-top: 50px;
  list-style-type: none;
  /* リストマーカーを削除 */
  padding: 0;
  /* デフォルトのパディングを削除 */
}

.blog-list-item {
  margin-bottom: 10px;
  /* リストアイテム間の余白 */
  font-size: 18px;
}

.blog-link {
  display: block;
  color: black
}
</style>