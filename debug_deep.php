<?php
echo "<h1>Explorador de Arquivos KingHost</h1>";

$root = '/home/vrdsolution';

echo "<h2>Conteudo de $root</h2>";
if (is_dir($root)) {
    $files = scandir($root);
    echo "<ul>";
    foreach($files as $file) {
        if($file != '.' && $file != '..') {
            $path = $root . '/' . $file;
            $type = is_dir($path) ? "[PASTA]" : "[ARQUIVO]";
            echo "<li>$type $file</li>";
        }
    }
    echo "</ul>";
} else {
    echo "<p>Nao foi possivel ler a raiz.</p>";
}

echo "<h2>Conteudo de $root/apps_wsgi (se existir)</h2>";
$apps = $root . '/apps_wsgi';
if (is_dir($apps)) {
    $files = scandir($apps);
    echo "<ul>";
    foreach($files as $file) {
        if($file != '.' && $file != '..') {
            echo "<li>$file</li>";
        }
    }
    echo "</ul>";
} else {
    echo "<p>Pasta apps_wsgi nao encontrada ou sem permissao.</p>";
}

echo "<h2>Tentativa de achar Python local</h2>";
$local_bin = $root . '/.local/bin';
if (is_dir($local_bin)) {
    $files = scandir($local_bin);
    echo "<ul>";
    foreach($files as $file) {
        if (strpos($file, 'python') !== false) {
            echo "<li style='color:blue'>ACHEI: $file</li>";
        }
    }
    echo "</ul>";
} else {
    echo "<p>Pasta .local/bin nao encontrada.</p>";
}
?>
