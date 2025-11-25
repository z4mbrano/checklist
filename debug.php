<?php
echo "<h1>Diagnostico KingHost</h1>";
echo "<h2>1. Onde estou?</h2>";
echo "<p>Pasta atual: <strong>" . getcwd() . "</strong></p>";

echo "<h2>2. O que tem aqui?</h2>";
$files = scandir('.');
echo "<ul>";
foreach($files as $file) {
    if($file != '.' && $file != '..') {
        echo "<li>" . $file . "</li>";
    }
}
echo "</ul>";

echo "<h2>3. Onde esta o Python?</h2>";
$venv_path = '/home/vrdsolution/.local/share/virtualenvs/checklist/bin/python3';

if (file_exists($venv_path)) {
    echo "<p style='color:green'>✅ Virtualenv encontrado em: $venv_path</p>";
} else {
    echo "<p style='color:red'>❌ Virtualenv NAO encontrado em: $venv_path</p>";
    echo "<p>Tentando localizar python3 no servidor...</p>";
    $output = shell_exec('find /home/vrdsolution -name "python3" -type f -not -path "*/.*" 2>&1');
    echo "<pre>" . $output . "</pre>";
}

echo "<h2>4. Teste de Permissao</h2>";
echo "<p>Usuario executando o PHP: " . get_current_user() . "</p>";
?>
