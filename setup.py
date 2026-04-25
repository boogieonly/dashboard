import os

# Criar estrutura de diretórios
directories = [
    'src/components/common',
    'src/components/dashboard',
    'src/components/layout',
    'src/components/charts',
    'src/lib',
    'src/hooks',
    'src/types',
    'src/constants'
]

for directory in directories:
    os.makedirs(directory, exist_ok=True)
    print(f"✅ Criado: {directory}")

print("\n🎉 Estrutura criada com sucesso!")
