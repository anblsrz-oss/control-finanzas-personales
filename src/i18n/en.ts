// Diccionario inglés. Las claves son el texto en español (claves naturales);
// si una clave no está aquí, i18next cae al español (fallbackLng: 'es').
// Interpolaciones con {{var}} se conservan igual en ambos idiomas.

export const en: Record<string, string> = {
  // Navegación
  Resumen: 'Summary',
  Cuentas: 'Accounts',
  Tarjetas: 'Cards',
  Transacciones: 'Transactions',
  'Movs.': 'Txns',
  Importar: 'Import',
  'Escanear recibo': 'Scan receipt',
  Recibos: 'Receipts',
  Familia: 'Family',
  'Sincronizar correo': 'Sync email',
  Correo: 'Email',
  'Sincronizar SMS': 'Sync SMS',
  SMS: 'SMS',
  Conectar: 'Connect',
  Categorías: 'Categories',
  Presupuestos: 'Budgets',
  'Presup.': 'Budgets',
  Rendimientos: 'Yields',
  'Rendim.': 'Yields',
  Reportes: 'Reports',
  Configuración: 'Settings',
  Ajustes: 'Settings',
  Admin: 'Admin',
  Más: 'More',
  'Más opciones': 'More options',
  Usuario: 'User',

  // Común
  Cancelar: 'Cancel',
  Crear: 'Create',
  Editar: 'Edit',
  Eliminar: 'Delete',
  'Guardando…': 'Saving…',
  'Eliminando…': 'Deleting…',
  'Cargando…': 'Loading…',
  Aceptar: 'Accept',
  Rechazar: 'Decline',
  Invitar: 'Invite',
  'Cargando usuarios...': 'Loading users...',
  'Error:': 'Error:',
  'Error desconocido': 'Unknown error',
  'No hay sesión activa': 'No active session',
  Tipo: 'Type',
  Monto: 'Amount',
  Moneda: 'Currency',
  Fecha: 'Date',
  Concepto: 'Concept',
  Categoría: 'Category',
  'Sin categoría': 'No category',
  'Sin concepto': 'No concept',
  Cuenta: 'Account',
  'O tarjeta': 'Or card',
  'Selecciona una cuenta': 'Select an account',
  'Selecciona una tarjeta': 'Select a card',
  Ingreso: 'Income',
  Egreso: 'Expense',
  Verificado: 'Verified',
  'Sin banco': 'No bank',
  'Sin marca': 'No brand',

  // Login
  'Organiza tus ingresos, gastos y cuentas en un solo lugar.':
    'Organize your income, expenses and accounts in one place.',
  'Continuar con Google': 'Continue with Google',
  'Al continuar aceptas nuestros': 'By continuing you accept our',
  'y nuestra': 'and our',

  // Dashboard / Reportes
  'Vista general de tus ingresos, egresos y balance.':
    'Overview of your income, expenses and balance.',
  'Total Ingresos': 'Total Income',
  'Total Egresos': 'Total Expenses',
  Balance: 'Balance',
  'Ingresos vs Egresos': 'Income vs Expenses',
  'Gastos por Categoría': 'Expenses by Category',
  'Sin transacciones este mes.': 'No transactions this month.',
  'Sin transacciones en este período.': 'No transactions in this period.',
  'Gráficas de ingresos y gastos por período, cuenta y tarjeta.':
    'Income and expense charts by period, account and card.',
  'Rango de fechas': 'Date range',
  Desde: 'From',
  Hasta: 'To',
  'Premium: filtra por rango de fechas personalizado, cuenta o tarjeta. Actualiza tu plan para más análisis.':
    'Premium: filter by custom date range, account or card. Upgrade your plan for more analytics.',
  'Ingresos y Egresos por Tarjeta': 'Income and Expenses by Card',
  'Ingresos y Egresos por Cuenta': 'Income and Expenses by Account',
  'Uso de línea de crédito': 'Credit line usage',
  'Sin líneas de crédito registradas.': 'No credit lines registered.',
  'Sin movimientos en este período.': 'No activity in this period.',
  'Sin asignar': 'Unassigned',
  'Sin gastos en este período': 'No expenses in this period',
  // Configuración de gráficos
  'Configurar gráfico': 'Configure chart',
  'Restablecer colores': 'Reset colors',
  'Incluir en Excel': 'Include in Excel',
  'Cambiar color': 'Change color',
  Subir: 'Move up',
  Bajar: 'Move down',
  Mostrar: 'Show',
  Series: 'Series',
  Elementos: 'Items',
  Listo: 'Done',
  Gasto: 'Spending',
  'Uso bajo': 'Low usage',
  'Uso medio': 'Medium usage',
  'Uso alto': 'High usage',

  // Transacciones
  'Ingresos, egresos y transferencias entre tus cuentas.':
    'Income, expenses and transfers between your accounts.',
  'Ocultar historial': 'Hide history',
  'Historial ({{count}})': 'History ({{count}})',
  '+ Nueva transacción': '+ New transaction',
  'Historial de transacciones eliminadas': 'Deleted transactions history',
  Filtros: 'Filters',
  'Limpiar filtros': 'Clear filters',
  '{{count}} transacciones': '{{count}} transactions',
  'Ninguna transacción coincide con los filtros.':
    'No transactions match the filters.',
  Buscar: 'Search',
  'Concepto o nota…': 'Concept or note…',
  Todos: 'All',
  Todas: 'All',
  Pendientes: 'Pending',
  Conciliadas: 'Settled',
  Transferencia: 'Transfer',
  'Monto mín.': 'Min amount',
  'Monto máx.': 'Max amount',
  'Sin opciones': 'No options',
  'Aún no has eliminado ninguna.': "You haven't deleted any yet.",
  eliminada: 'deleted',
  'Motivo:': 'Reason:',
  'Sin transacciones. Registra una para empezar.':
    'No transactions. Add one to get started.',
  Pendiente: 'Pending',
  'Eliminar transacción': 'Delete transaction',
  'Vas a eliminar': 'You are about to delete',
  por: 'for',
  'El balance de tus cuentas se ajustará automáticamente.':
    'Your account balances will adjust automatically.',
  'Motivo de la eliminación': 'Reason for deletion',
  'Ej. Registrada por error, duplicada, monto incorrecto…':
    'E.g. Recorded by mistake, duplicated, wrong amount…',
  'Escribe el motivo de la eliminación.': 'Write the reason for deletion.',

  // TransactionForm
  '📥 Ingreso': '📥 Income',
  '📤 Egreso': '📤 Expense',
  '🔄 Transferencia': '🔄 Transfer',
  'Ej: Almuerzo': 'E.g. Lunch',
  'Cuenta destino': 'Destination account',
  Requerida: 'Required',
  'Cuenta origen': 'Source account',
  'Selecciona origen': 'Select source',
  'Selecciona destino': 'Select destination',
  'Selecciona la cuenta destino': 'Select the destination account',
  'Selecciona una cuenta o tarjeta': 'Select an account or card',
  'Selecciona cuenta origen y destino': 'Select source and destination accounts',
  'Las cuentas no pueden ser la misma': 'The accounts cannot be the same',
  Compra: 'Purchase',
  Familiar: 'Family',
  'Este gasto se registrará en el plan familiar, no en tus finanzas personales.':
    'This expense will be recorded in the family plan, not in your personal finances.',
  'Gasto familiar (se registra en el plan familiar)':
    'Family expense (recorded in the family plan)',
  'Meses sin intereses / Diferido': 'Interest-free months / Deferred',
  Meses: 'Months',
  'Interés ($)': 'Interest ($)',
  'Notas (opcional)': 'Notes (optional)',
  'Detalles adicionales...': 'Additional details...',
  Registrar: 'Save',

  // Recibos
  'Toma una foto del ticket y registra el gasto automáticamente':
    'Take a photo of the receipt and record the expense automatically',
  'Fotografía el ticket con buena luz y lo más plano posible. Después podrás revisar y corregir los datos detectados.':
    'Photograph the receipt with good light and as flat as possible. Then you can review and correct the detected data.',
  'Tomar foto': 'Take photo',
  'o subir una imagen existente': 'or upload an existing image',
  'Leyendo el ticket…': 'Reading the receipt…',
  'Revisa y corrige los datos': 'Review and correct the data',
  'Concepto / comercio': 'Concept / merchant',
  'Ej: Supermercado': 'E.g. Supermarket',
  'Registrar gasto': 'Save expense',
  'Ocultar texto detectado': 'Hide detected text',
  'Ver texto detectado': 'See detected text',
  '(sin texto)': '(no text)',
  'Gasto registrado correctamente.': 'Expense recorded successfully.',
  'Escanear otro': 'Scan another',
  'Ver movimientos': 'See transactions',
  'error desconocido': 'unknown error',
  'Este recibo ya fue registrado (movimiento duplicado).':
    'This receipt was already recorded (duplicate transaction).',
  'No se pudo leer el ticket: {{error}}. Revisa tu conexión (la primera vez se descarga el motor OCR) e intenta de nuevo.':
    'Could not read the receipt: {{error}}. Check your connection (the OCR engine is downloaded the first time) and try again.',

  // Familia
  'Comparte tarjetas con tu familia y lleven los gastos juntos':
    'Share cards with your family and track expenses together',
  'Te invitaron a la familia': 'You were invited to the family',
  'Sin nombre': 'No name',
  'Crear plan familiar': 'Create family plan',
  'Como jefe de familia podrás invitar a tus familiares por correo y compartirles tus tarjetas de crédito. Ellos registran sus gastos y tú mantienes el control: solo tú ves el límite de tus tarjetas.':
    'As family head you can invite your relatives by email and share your credit cards with them. They record their expenses and you stay in control: only you see your cards’ limits.',
  'Nombre de la familia': 'Family name',
  'Función Premium': 'Premium feature',
  'El plan familiar permite al jefe de familia compartir tarjetas con sus familiares y llevar los gastos del hogar por separado. Hazte Premium para crear tu familia. (Ser miembro invitado no requiere Premium.)':
    'The family plan lets the family head share cards with relatives and track household expenses separately. Go Premium to create your family. (Being an invited member does not require Premium.)',
  miembros: 'members',
  'Salir de la familia': 'Leave the family',
  '¿Salir de la familia? Tus gastos familiares pasados seguirán en el historial de la familia.':
    'Leave the family? Your past family expenses will remain in the family history.',
  'Ese correo ya fue invitado.': 'That email was already invited.',
  '¿Quitar a {{name}}? Sus gastos familiares pasados se conservan en el historial.':
    'Remove {{name}}? Their past family expenses are kept in the history.',
  'Aún no hay miembros.': 'No members yet.',
  'Invita a alguien con su correo.': 'Invite someone with their email.',
  'Tarjetas compartidas': 'Shared cards',
  'No tienes tarjetas de crédito registradas. Crea una en Tarjetas para poder compartirla.':
    "You have no credit cards registered. Create one in Cards to share it.",
  'Gasto familiar:': 'Family spend:',
  'Disponible total:': 'Total available:',
  'Dejar de compartir': 'Stop sharing',
  Compartir: 'Share',
  'El jefe de familia aún no comparte tarjetas.':
    "The family head hasn't shared cards yet.",
  'Gasto familiar acumulado:': 'Accumulated family spend:',
  'Registra gastos con estas tarjetas desde Transacciones eligiendo la tarjeta marcada como familiar.':
    'Record expenses with these cards from Transactions by choosing the card marked as family.',
  'Movimientos familiares': 'Family transactions',
  'Todavía no hay gastos familiares registrados.':
    'No family expenses recorded yet.',
  Miembro: 'Member',
  Tarjeta: 'Card',
  Activo: 'Active',
  Rechazó: 'Declined',

  // Cuentas
  'Tus cuentas y bancos, con saldo y rendimientos.':
    'Your accounts and banks, with balance and yields.',
  '+ Agregar cuenta': '+ Add account',
  '¿Eliminar esta cuenta?': 'Delete this account?',
  'Sin cuentas. Crea una para empezar.': 'No accounts. Create one to get started.',
  'Rendimiento:': 'Yield:',
  mensual: 'monthly',
  'Se implementa en Fase 3': 'Implemented in Phase 3',
  'Plan gratis: máximo 2 cuentas. Actualiza a Premium para agregar más.':
    'Free plan: max 2 accounts. Upgrade to Premium to add more.',
  // AccountForm
  'Nombre de la cuenta': 'Account name',
  'Mi cuenta principal': 'My main account',
  'Banco (opcional)': 'Bank (optional)',
  'Banco X': 'Bank X',
  Corriente: 'Checking',
  Ahorro: 'Savings',
  Inversión: 'Investment',
  Efectivo: 'Cash',
  'Saldo inicial': 'Initial balance',
  'Esta cuenta genera rendimientos': 'This account generates yields',
  'Rendimiento mensual (%)': 'Monthly yield (%)',
  'Crear cuenta': 'Create account',

  // Tarjetas
  'Tarjetas de crédito y débito con límite, uso y fechas.':
    'Credit and debit cards with limit, usage and dates.',
  '+ Agregar tarjeta': '+ Add card',
  '¿Eliminar esta tarjeta?': 'Delete this card?',
  'Sin tarjetas. Crea una para empezar.': 'No cards. Create one to get started.',
  '💳 Crédito': '💳 Credit',
  '💰 Débito': '💰 Debit',
  'Ligada a:': 'Linked to:',
  'Corte:': 'Cut-off:',
  'Pago:': 'Payment:',
  Usado: 'Used',
  Límite: 'Limit',
  Disponible: 'Available',
  Saldo: 'Balance',
  'Plan gratis: máximo 2 tarjetas. Actualiza a Premium para agregar más.':
    'Free plan: max 2 cards. Upgrade to Premium to add more.',
  // CardForm
  'Nombre de la tarjeta': 'Card name',
  'Mi Visa': 'My Visa',
  'Marca (opcional)': 'Brand (optional)',
  'Visa, Mastercard...': 'Visa, Mastercard...',
  'Cuenta ligada': 'Linked account',
  'Límite de crédito': 'Credit limit',
  'Día de corte': 'Cut-off day',
  'Día de pago': 'Payment day',
  'Crear tarjeta': 'Create card',
  // Formato y marca
  Formato: 'Format',
  '💳 Física': '💳 Physical',
  '☁️ Virtual': '☁️ Virtual',
  Virtual: 'Virtual',
  Marca: 'Brand',
  'Selecciona una marca': 'Select a brand',
  'Otra…': 'Other…',
  '¿Cuál marca?': 'Which brand?',
  'Ej: Carnet, UnionPay': 'E.g. Carnet, UnionPay',
  // Líneas de crédito
  'Línea de crédito': 'Credit line',
  'Selecciona una línea': 'Select a line',
  '➕ Nueva línea de crédito': '➕ New credit line',
  'Varias tarjetas del mismo banco comparten un solo límite y las mismas fechas de corte y pago. Selecciona la línea que ya usas o crea una nueva.':
    'Several cards from the same bank share a single limit and the same cut-off and payment dates. Pick the line you already use, or create a new one.',
  'Nombre de la línea': 'Line name',
  'Ej: Nu': 'E.g. Nu',
  'Las fechas se recorren en días inhábiles': 'Dates shift on non-business days',
  'Te preguntaremos la fecha real cuando llegue el corte.':
    "We'll ask you for the real date when the cut-off comes around.",
  'Hereda de {{name}}: límite {{limit}}{{dates}}':
    'Inherits from {{name}}: limit {{limit}}{{dates}}',
  ', corte el día {{cut}} y pago el día {{pay}}':
    ', cut-off on day {{cut}} and payment on day {{pay}}',
  '{{n}} tarjetas · límite compartido': '{{n}} cards · shared limit',
  'Otras tarjetas': 'Other cards',
  'Gasto de esta tarjeta': 'This card’s spend',
  // Periodos de corte/pago
  '¿Tu corte de {{name}} fue el {{date}}?': 'Was your {{name}} cut-off on {{date}}?',
  'Marcaste que esta línea recorre sus fechas en días inhábiles. Confírmala para que los periodos cuadren.':
    'You marked this line as shifting its dates on non-business days. Confirm it so the periods add up.',
  'Sí, fue esa fecha': 'Yes, that was the date',
  'Fue otro día': 'It was another day',
  'Ver historial de periodos': 'View period history',
  // MSI retroactivo
  'Mes en que empezó el plan': 'Month the plan started',
  'Este plan empezó en {{month}} (hace {{n}} meses).':
    'This plan started in {{month}} ({{n}} months ago).',
  '¿Ya pagaste mensualidades anteriores?': 'Have you already paid earlier installments?',
  'Sí, ya pagué algunas': 'Yes, I already paid some',
  '¿Cuántas de {{total}}?': 'How many out of {{total}}?',
  'Se registrará un ajuste de {{amount}} con fecha {{date}} para que el historial no quede negativo.':
    'An adjustment of {{amount}} dated {{date}} will be recorded so your history doesn’t go negative.',
  'Ajuste: {{n}} mensualidades ya pagadas de {{desc}}':
    'Adjustment: {{n}} installments already paid for {{desc}}',
  'Ajuste de saldo': 'Balance adjustment',
  // Total de cuentas
  'Total en cuentas': 'Total in accounts',
  // Rendimientos: tasa anual, plazo fijo, ISR
  'Rendimiento (%)': 'Yield (%)',
  'La tasa es': 'The rate is',
  Anual: 'Annual',
  Mensual: 'Monthly',
  anual: 'annual',
  'Los bancos y SOFIPOs publican la tasa anual. Equivale a {{rate}}% este mes ({{days}} días).':
    'Banks and SOFIPOs publish the annual rate. That is {{rate}}% this month ({{days}} days).',
  'Equivale a {{rate}}% anual.': 'That is {{rate}}% annual.',
  'Tipo de rendimiento': 'Yield type',
  'A la vista (se paga cada mes)': 'On demand (paid monthly)',
  'Plazo fijo (se paga al vencer)': 'Fixed term (paid at maturity)',
  'Plazo (días)': 'Term (days)',
  'Vence el': 'Matures on',
  'plazo fijo': 'fixed term',
  'plazo fijo, vence {{date}}': 'fixed term, matures {{date}}',
  'Descontar retención de ISR': 'Deduct income tax withholding',
  'Se retiene sobre el capital, no sobre el interés. La tasa la fija cada año la Ley de Ingresos.':
    'Withheld on the principal, not on the interest. The rate is set each year by the Revenue Law.',
  'Tasa de ISR anual (%)': 'Annual withholding rate (%)',
  Bruto: 'Gross',
  ISR: 'Tax',
  neto: 'net',
  Visibilidad: 'Visibility',
  'Mostrar total de cuentas': 'Show accounts total',
  'El apartado con la suma de todas tus cuentas, arriba del listado.':
    'The panel with the sum of all your accounts, above the list.',
  confirmado: 'confirmed',
  corte: 'cut-off',
  pago: 'payment',
  días: 'days',
  hoy: 'today',
  'en {{n}} días': 'in {{n}} days',
  'hace {{n}} días': '{{n}} days ago',

  // Categorías
  'Clasifica tus ingresos y gastos.': 'Classify your income and expenses.',
  '+ Agregar categoría': '+ Add category',
  '¿Eliminar esta categoría?': 'Delete this category?',
  Nombre: 'Name',
  'Ej: Gasolina': 'E.g. Gas',
  'Ícono (emoji)': 'Icon (emoji)',
  'Mis categorías': 'My categories',
  'Categorías del sistema': 'System categories',
  'Sin categorías.': 'No categories.',

  // Rendimientos
  'Compara el crecimiento calculado contra el real.':
    'Compare the calculated growth against the actual one.',
  'Esta función es solo para Premium. Actualiza tu plan para usarla.':
    'This feature is Premium only. Upgrade your plan to use it.',
  'Sin cuentas con rendimiento. Crea una cuenta con opción de rendimiento en Cuentas.':
    'No accounts with yield. Create an account with the yield option in Accounts.',
  'Saldo actual': 'Current balance',
  'Crecimiento esperado': 'Expected growth',
  'Crecimiento real': 'Actual growth',
  Histórico: 'History',
  'Esperado:': 'Expected:',
  'Real:': 'Actual:',
  '¿Eliminar este registro?': 'Delete this record?',
  'Registra el crecimiento real': 'Record the actual growth',
  '(Editar)': '(Edit)',
  'de este mes': 'for this month',
  Mes: 'Month',
  'Crecimiento real ($)': 'Actual growth ($)',
  'vs esperado': 'vs expected',
  Actualizar: 'Update',
  Verificar: 'Verify',

  // Admin
  'Panel Admin': 'Admin Panel',
  'Gestiona usuarios y sus permisos de premium.':
    'Manage users and their premium permissions.',
  'Sin usuarios.': 'No users.',
  Email: 'Email',
  Estado: 'Status',
  Acciones: 'Actions',
  Gratis: 'Free',
  'Actualizando...': 'Updating...',
  'Quitar Premium': 'Remove Premium',
  'Dar Premium': 'Grant Premium',

  // Correo
  'Lee las alertas de tu banco desde tu Gmail y crea movimientos pendientes. Gratis y casi en tiempo real.':
    'Read your bank alerts from Gmail and create pending transactions. Free and near real time.',
  '1. Remitentes de tu banco': '1. Your bank senders',
  'Indica de qué correos llegan las alertas (ej.':
    'Indicate which emails the alerts come from (e.g.',
  'Solo se leen esos correos.': 'Only those emails are read.',
  Banco: 'Bank',
  'Remitentes (separados por coma)': 'Senders (comma separated)',
  'Regex de monto (opcional)': 'Amount regex (optional)',
  'Guardar remitente': 'Save sender',
  '2. Conecta Gmail y sincroniza': '2. Connect Gmail and sync',
  'Asignar a la cuenta (opcional)': 'Assign to account (optional)',
  'Sin cuenta': 'No account',
  'Conectar Gmail': 'Connect Gmail',
  'Gmail conectado': 'Gmail connected',
  'Sincronizando…': 'Syncing…',
  'Sincronizar ahora': 'Sync now',
  'Agrega al menos un remitente arriba antes de sincronizar.':
    'Add at least one sender above before syncing.',
  'Los movimientos se crean como pendientes: revísalos y confírmalos en Transacciones para que cuenten en tus saldos.':
    'Transactions are created as pending: review and confirm them in Transactions so they count in your balances.',
  'Correos encontrados: {{found}}. Movimientos nuevos (pendientes): {{inserted}}{{dups}}.':
    'Emails found: {{found}}. New transactions (pending): {{inserted}}{{dups}}.',
  ', {{n}} duplicados': ', {{n}} duplicates',

  // SMS
  'Lee las alertas de compra por SMS de tu banco. Disponible solo en la app de Android.':
    'Read your bank purchase alerts via SMS. Available only in the Android app.',
  '📵 Apple no permite que las apps lean SMS. En iPhone usa "Sincronizar correo" o "Importar" tu estado de cuenta.':
    '📵 Apple does not allow apps to read SMS. On iPhone use "Sync email" or "Import" your statement.',
  'Esta función solo está disponible en la app instalada de Android. En el navegador no se pueden leer SMS.':
    'This feature is only available in the installed Android app. SMS cannot be read in the browser.',
  '1. Remitentes de SMS de tu banco': '1. Your bank SMS senders',
  'Remitentes (coma)': 'Senders (comma)',
  '2. Leer SMS': '2. Read SMS',
  'Leyendo…': 'Reading…',
  'Leer SMS y crear pendientes': 'Read SMS and create pending',
  'Se pedirá permiso para leer SMS. Los movimientos se crean como pendientes; confírmalos en Transacciones.':
    'Permission to read SMS will be requested. Transactions are created as pending; confirm them in Transactions.',
  'SMS leídos: {{found}}. Movimientos nuevos (pendientes): {{inserted}}{{dups}}.':
    'SMS read: {{found}}. New transactions (pending): {{inserted}}{{dups}}.',

  // Importar
  'Importar movimientos': 'Import transactions',
  'Sube el estado de cuenta (CSV) de tu banco y conviértelo en transacciones. Tus datos no salen a terceros.':
    "Upload your bank's statement (CSV) and turn it into transactions. Your data isn't shared with third parties.",
  'Primero crea una cuenta para poder importar movimientos.':
    'First create an account to import transactions.',
  '1. Cuenta destino y archivo': '1. Destination account and file',
  'Usar mapeo guardado': 'Use saved mapping',
  'Nuevo mapeo…': 'New mapping…',
  'Archivo CSV': 'CSV file',
  '2. Mapea las columnas de {{file}}': '2. Map the columns of {{file}}',
  'La primera fila son encabezados': 'The first row are headers',
  'Columna de Fecha': 'Date column',
  'Formato de fecha': 'Date format',
  'Columna de Concepto': 'Concept column',
  'Formato de monto': 'Amount format',
  'Una columna con signo (+/-)': 'One column with sign (+/-)',
  'Columnas de cargo y abono': 'Debit and credit columns',
  'Columna de Monto': 'Amount column',
  'Columna de Cargo (egreso)': 'Debit column (expense)',
  'Columna de Abono (ingreso)': 'Credit column (income)',
  'Separador decimal': 'Decimal separator',
  'Punto (1,234.56)': 'Dot (1,234.56)',
  'Coma (1.234,56)': 'Comma (1.234,56)',
  'Categoría por defecto (opcional)': 'Default category (optional)',
  'Nombre del banco (para guardar el mapeo)': 'Bank name (to save the mapping)',
  'Ej. BBVA, Nu, Klar…': 'E.g. BBVA, Nu, Klar…',
  'Guardar mapeo': 'Save mapping',
  '— sin asignar —': '— unassigned —',
  'Columna {{n}}': 'Column {{n}}',
  '3. Previsualización ({{count}} movimientos)': '3. Preview ({{count}} transactions)',
  '({{n}} con error)': '({{n}} with error)',
  'Importando…': 'Importing…',
  'Confirmar e importar ({{count}})': 'Confirm and import ({{count}})',
  'Selecciona la cuenta destino para poder importar.':
    'Select the destination account to import.',
  'Mostrando 200 de {{total}}. Se importarán todos.':
    'Showing 200 of {{total}}. All will be imported.',
  'Importadas {{inserted}} de {{total}} ({{duplicates}} duplicadas omitidas).':
    'Imported {{inserted}} of {{total}} ({{duplicates}} duplicates skipped).',

  // PremiumGate
  'Plan gratis: máximo 2. Actualiza a Premium para más.':
    'Free plan: max 2. Upgrade to Premium for more.',

  // Configuración
  'Tu cuenta y preferencias': 'Your account and preferences',
  Perfil: 'Profile',
  'El nombre y la foto vienen de tu cuenta de Google.':
    'Your name and photo come from your Google account.',
  Apariencia: 'Appearance',
  Claro: 'Light',
  Oscuro: 'Dark',
  Sistema: 'System',
  Idioma: 'Language',
  Teléfono: 'Phone',
  'Sin teléfono conectado. Próximamente podrás vincular tu número con verificación por SMS.':
    'No phone connected. Soon you will be able to link your number with SMS verification.',
  Suscripción: 'Subscription',
  'Tienes acceso a todas las funciones.': 'You have access to all features.',
  'Plan gratuito. Premium desbloquea plan familiar, MSI/diferidos y rendimientos.':
    'Free plan. Premium unlocks family plan, installments and yields.',
  'Plan familiar': 'Family plan',
  'Tienes {{count}} invitación(es) pendiente(s).':
    'You have {{count}} pending invitation(s).',
  '(eres el jefe de familia)': '(you are the family head)',
  '(miembro)': '(member)',
  'Ver familia': 'View family',
  'No participas en ningún plan familiar.': 'You are not part of any family plan.',
  'Crearlo requiere Premium.': 'Creating one requires Premium.',
  'Saber más': 'Learn more',
  Tutorial: 'Tutorial',
  'Vuelve a ver el recorrido guiado por las secciones de la app.':
    'Watch the guided tour of the app sections again.',
  'Ver tutorial de nuevo': 'Watch tutorial again',
  Sesión: 'Session',
  'Cerrar sesión': 'Sign out',

  // Stripe / suscripción
  'Gestionar suscripción': 'Manage subscription',
  'Hacerse Premium': 'Go Premium',
  'Abriendo…': 'Opening…',
  '7 días de prueba gratis. Cancela cuando quieras.':
    '7-day free trial. Cancel anytime.',
  '2 meses gratis': '2 months free',
  'El cobro lo hace Google Play. Cancela cuando quieras desde Google Play.':
    'Google Play handles the billing. Cancel anytime from Google Play.',
  '7 días de prueba gratis.': '7-day free trial.',
  'No se pudieron cargar los planes de Google Play. Inténtalo más tarde.':
    'Could not load the Google Play plans. Please try again later.',
  'No encontramos compras de Google Play para restaurar.':
    'We found no Google Play purchases to restore.',
  'Restaurar compra': 'Restore purchase',

  // Planes en la landing
  Planes: 'Pricing',
  'Empieza gratis. Cambia o cancela cuando quieras.':
    'Start free. Change or cancel anytime.',
  'Más popular': 'Most popular',
  'Ver planes': 'See plans',
  'Gratis para empezar. Premium desde $107 al mes con 7 días de prueba.':
    'Free to start. Premium from $107/month with a 7-day trial.',
  'para siempre': 'forever',
  'Premium mensual': 'Premium monthly',
  'al mes': 'per month',
  'Premium anual': 'Premium yearly',
  'al año': 'per year',
  '7 días de prueba gratis': '7-day free trial',
  'Empezar prueba gratis': 'Start free trial',
  'Hasta {{n}} cuentas': 'Up to {{n}} accounts',
  'Hasta {{n}} tarjetas': 'Up to {{n}} cards',
  'Hasta {{n}} presupuestos': 'Up to {{n}} budgets',
  'Cuentas ilimitadas': 'Unlimited accounts',
  'Tarjetas ilimitadas': 'Unlimited cards',
  'Presupuestos ilimitados': 'Unlimited budgets',
  'Escaneo de recibos y reportes': 'Receipt scanning and reports',
  'Cuentas, tarjetas y presupuestos ilimitados':
    'Unlimited accounts, cards and budgets',
  'Filtros avanzados de reportes': 'Advanced report filters',
  'Plan familiar: comparte con tu familia': 'Family plan: share with your family',
  'MSI y diferidos mes a mes': 'Installment plans, month by month',
  'Rendimientos de tus cuentas': 'Yields on your accounts',
  'Todo lo del plan mensual': 'Everything in the monthly plan',
  'Ahorras $247 al año': 'Save $247 per year',
  'Los planes de pago se cobran en pesos mexicanos. Cancela desde la app en cualquier momento.':
    'Paid plans are billed in Mexican pesos. Cancel from the app at any time.',

  // Teléfono / SMS
  Cambiar: 'Change',
  'Número de teléfono': 'Phone number',
  'Código de verificación': 'Verification code',
  'Enviar código': 'Send code',
  'Enviando…': 'Sending…',
  'Verificando…': 'Verifying…',
  'Reenviar código': 'Resend code',
  'Reenviar en {{s}}s': 'Resend in {{s}}s',
  'Escribe tu número en formato internacional, ej. +5215512345678':
    'Enter your number in international format, e.g. +5215512345678',
  'El envío de SMS no está configurado. Contacta al administrador.':
    'SMS sending is not configured. Contact the administrator.',
  'No se pudo enviar el código.': 'Could not send the code.',
  'Código incorrecto.': 'Incorrect code.',

  // Login (correo / código)
  'o con tu correo': 'or with your email',
  'tucorreo@ejemplo.com': 'youremail@example.com',
  'Escribe tu correo.': 'Enter your email.',
  'Te enviamos un código de acceso a {{email}}.':
    'We sent an access code to {{email}}.',
  'Escribe el código completo que te llegó al correo.':
    'Enter the full code you received by email.',
  'Código incorrecto o expirado. Intenta de nuevo.':
    'Incorrect or expired code. Try again.',
  'Verificar y entrar': 'Verify and enter',
  'Usar otro correo': 'Use another email',
  '← Volver al inicio': '← Back to home',

  // Landing
  'Iniciar sesión': 'Sign in',
  'Tus finanzas personales, claras y en un solo lugar.':
    'Your personal finances, clear and all in one place.',
  'Organiza ingresos, gastos, cuentas y tarjetas. Escanea recibos y entiende a dónde va tu dinero.':
    'Organize income, expenses, accounts and cards. Scan receipts and understand where your money goes.',
  'Crear cuenta gratis': 'Create free account',
  'Ya tengo cuenta': 'I already have an account',
  'Todas las funciones gratuitas por el momento.':
    'All features free for now.',
  'Cómo funciona': 'How it works',
  'Conecta tus cuentas': 'Connect your accounts',
  'Registra cuentas y tarjetas, o sincroniza tus movimientos desde el correo.':
    'Add accounts and cards, or sync your transactions from email.',
  'Captura sin esfuerzo': 'Capture effortlessly',
  'Escanea tickets y facturas con la cámara o sube un PDF; Mi Control de Finanzas Personales extrae los datos.':
    'Scan receipts and invoices with the camera or upload a PDF; Mi Control de Finanzas Personales extracts the data.',
  'Entiende tu dinero': 'Understand your money',
  'Mira tu balance, gastos por categoría y reportes claros en un solo lugar.':
    'See your balance, spending by category and clear reports all in one place.',
  'Todo lo que necesitas': 'Everything you need',
  'Cuentas y tarjetas': 'Accounts and cards',
  'Controla saldos, límites y fechas de corte.':
    'Track balances, limits and cut-off dates.',
  'Recibos con OCR': 'Receipts with OCR',
  'Foto o PDF del ticket y listo.': 'A photo or PDF of the receipt and done.',
  'Sincronización por correo': 'Email sync',
  'Importa cargos desde tus notificaciones.':
    'Import charges from your notifications.',
  'Comparte tarjetas y gastos con tu familia.':
    'Share cards and expenses with your family.',
  'Multi-moneda': 'Multi-currency',
  'Registra en varias monedas.': 'Record in several currencies.',
  'Modo oscuro e idiomas': 'Dark mode and languages',
  'Español e inglés, claro y oscuro.': 'Spanish and English, light and dark.',
  'Llévala en tu celular': 'Take it on your phone',
  'Aplicación': 'App',
  'Instala Mi Control de Finanzas Personales en tu teléfono y llévala contigo.':
    'Install Mi Control de Finanzas Personales on your phone and take it with you.',
  'Versión {{version}}': 'Version {{version}}',
  'Empezar ahora': 'Start now',
  '¿Ideas para mejorar?': 'Ideas to improve?',
  'Cuéntanos qué te gustaría ver en Mi Control de Finanzas Personales. Leemos todos los comentarios.':
    'Tell us what you would like to see in Mi Control de Finanzas Personales. We read every comment.',
  'Tu nombre (opcional)': 'Your name (optional)',
  'Tu correo (opcional)': 'Your email (optional)',
  '¿Qué te gustaría mejorar o agregar?': 'What would you like to improve or add?',
  'Enviar comentario': 'Send comment',
  'No se pudo enviar. Intenta más tarde.': 'Could not send. Try again later.',
  '¡Gracias! Recibimos tu comentario.': 'Thanks! We received your comment.',
  'Mi Control de Finanzas Personales — Finanzas personales.': 'Mi Control de Finanzas Personales — Personal finance.',

  // Multimoneda
  'Moneda principal': 'Main currency',
  'Tu balance y reportes se muestran en esta moneda. Los movimientos en otra moneda se convierten con el tipo de cambio.':
    'Your balance and reports are shown in this currency. Transactions in another currency are converted using the exchange rate.',
  'Tipo de cambio ({{from}}→{{to}})': 'Exchange rate ({{from}}→{{to}})',
  'Obteniendo…': 'Fetching…',
  'Equivale a': 'Equivalent to',
  'No se obtuvo el tipo de cambio automático. Escríbelo manualmente.':
    'The automatic exchange rate was not obtained. Enter it manually.',
  'Puedes ajustar el tipo de cambio si lo necesitas.':
    'You can adjust the exchange rate if you need to.',
  'Tipo de cambio aproximado de hoy (no del día de la transacción). Ajústalo si lo necesitas.':
    "Approximate rate for today (not the transaction's date). Adjust it if you need to.",
  'Buscar moneda…': 'Search currency…',
  'Usar «{{code}}»': 'Use "{{code}}"',
  'Sin resultados. Escribe un código de 3 letras.':
    'No results. Type a 3-letter code.',
  Selecciona: 'Select',
  'Escribe un tipo de cambio válido.': 'Enter a valid exchange rate.',
  'Obteniendo tipo de cambio…': 'Fetching exchange rate…',
  '≈ {{base}} en tu moneda principal (tipo de cambio {{rate}}).':
    '≈ {{base}} in your main currency (rate {{rate}}).',
  'No se obtuvo el tipo de cambio. Registra el gasto desde Transacciones para ajustarlo.':
    'The exchange rate was not obtained. Record the expense from Transactions to adjust it.',
  'No se obtuvo el tipo de cambio. Intenta de nuevo o registra el gasto desde Transacciones.':
    'The exchange rate was not obtained. Try again or record the expense from Transactions.',

  // MVP 3 — Familia
  'Eliminar familia': 'Delete family',
  '¿Eliminar la familia "{{name}}"? Se borrarán los gastos familiares, los miembros y las tarjetas compartidas. Esta acción no se puede deshacer.':
    'Delete the family "{{name}}"? Family expenses, members and shared cards will be removed. This action cannot be undone.',

  // MVP 3 — Galería de emojis
  'Ícono': 'Icon',
  Dinero: 'Money',
  Comida: 'Food',
  Transporte: 'Transport',
  Hogar: 'Home',
  Salud: 'Health',
  Ocio: 'Leisure',
  Deportes: 'Sports',
  Compras: 'Shopping',
  'Trabajo/Estudio': 'Work/Study',
  Otros: 'Other',

  // MVP 3 — Beca
  Beca: 'Scholarship',
  'Es una cuenta de beca': 'This is a scholarship account',
  'Es una tarjeta de beca': 'This is a scholarship card',
  'Nombre de la beca (opcional)': 'Scholarship name (optional)',
  'Ej: Beca Benito Juárez': 'E.g. Benito Juárez Scholarship',

  // MVP 3 — Admin
  'Hacer Admin': 'Make Admin',
  'Quitar Admin': 'Remove Admin',
  'No puedes quitarte admin a ti mismo': "You can't remove your own admin",

  // MVP 4 — Tarjetas visuales + escaneo
  'Crédito': 'Credit',
  'Débito': 'Debit',
  'Escanear tarjeta con la cámara': 'Scan card with the camera',
  'Leyendo tarjeta…': 'Reading card…',
  'Por tu seguridad solo se leen la marca y los últimos 4 dígitos. No se guarda el número completo, CVC ni la fecha.':
    'For your security only the brand and last 4 digits are read. The full number, CVC and expiry date are not stored.',
  'Detectado: {{brand}} ····{{last4}}. Revisa y completa los datos.':
    'Detected: {{brand}} ····{{last4}}. Review and complete the details.',
  tarjeta: 'card',
  'No se detectaron los datos. Captúralos manualmente.':
    'No data detected. Enter it manually.',
  'No se pudo leer la tarjeta: {{error}}. Captúrala manualmente.':
    'Could not read the card: {{error}}. Enter it manually.',
  'Últimos 4 dígitos (opcional)': 'Last 4 digits (optional)',
  'Color de la tarjeta': 'Card color',

  // MVP 5 — Config admin (límites y premium)
  'Plan gratis: máximo {{n}} cuentas. Actualiza a Premium para agregar más.':
    'Free plan: max {{n}} accounts. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} tarjetas. Actualiza a Premium para agregar más.':
    'Free plan: max {{n}} cards. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} transacciones. Actualiza a Premium para registrar más.':
    'Free plan: max {{n}} transactions. Upgrade to Premium to record more.',
  'Planes y límites': 'Plans and limits',
  'Define los límites del plan gratis (0 = ilimitado) y qué funciones requieren Premium.':
    'Set the free plan limits (0 = unlimited) and which features require Premium.',
  'Máx. cuentas (gratis)': 'Max accounts (free)',
  'Máx. tarjetas (gratis)': 'Max cards (free)',
  'Máx. transacciones (gratis)': 'Max transactions (free)',
  'Funciones que requieren Premium': 'Features that require Premium',
  'Meses sin intereses / diferido': 'Interest-free months / deferred',
  'Filtros de reportes': 'Report filters',
  'Guardar configuración': 'Save configuration',
  'Guardado ✓': 'Saved ✓',

  // MVP 6 — XML CFDI
  'Fotografía el ticket con buena luz y lo más plano posible, o sube un PDF o XML (factura CFDI) de tu recibo. Después podrás revisar y corregir los datos detectados.':
    'Photograph the receipt with good light and as flat as possible, or upload a PDF or XML (CFDI invoice). Then you can review and correct the detected data.',
  'o subir una imagen, PDF o XML (factura)': 'or upload an image, PDF or XML (invoice)',
  'El XML no parece una factura CFDI (SAT). Verifica el archivo.':
    'The XML does not look like a CFDI (SAT) invoice. Check the file.',
  'No se pudo leer el XML: {{error}}.': 'Could not read the XML: {{error}}.',

  // MVP 7 — Actualización y descarga
  'Hay una nueva versión disponible.': 'A new version is available.',
  'Hay una nueva versión ({{v}}). Descarga la actualización.':
    'A new version ({{v}}) is available. Download the update.',
  Descargar: 'Download',
  Cerrar: 'Close',
  'Instálala como app desde tu navegador, o descarga el APK para Android.':
    'Install it as an app from your browser, or download the APK for Android.',
  'Descargar app (Android)': 'Download app (Android)',
  'En Android, permite instalar apps de orígenes desconocidos al abrir el archivo.':
    'On Android, allow installing apps from unknown sources when opening the file.',

  // Nombres de las categorías del sistema (viven en la BD en español; se
  // traducen al mostrarlas). Comida/Transporte/Hogar/Salud/Compras/
  // Rendimientos ya están arriba.
  Salario: 'Salary',
  'Otros ingresos': 'Other income',
  'Otros gastos': 'Other expenses',
  Entretenimiento: 'Entertainment',
  Servicios: 'Utilities',
  Cashback: 'Cashback',
  // 'Sin categoría' ya está definida más arriba.

  // Ajustes 2 — privacidad, gráficas y export
  'Ocultar montos': 'Hide amounts',
  'Mostrar montos': 'Show amounts',
  Color: 'Color',
  'Guardar cambios': 'Save changes',
  'Ofrece cashback': 'Offers cashback',
  '(regístralo como ingreso con la categoría Cashback)':
    '(record it as income using the Cashback category)',
  Barras: 'Bars',
  Líneas: 'Lines',
  Pastel: 'Pie',
  Dona: 'Donut',
  'Paleta de colores': 'Color palette',
  'Por categoría': 'By category',
  Vivo: 'Vivid',
  Océano: 'Ocean',
  Cálido: 'Warm',
  Ingresos: 'Income',
  Egresos: 'Expenses',
  'Gastos por categoría': 'Expenses by category',
  'Exportar a Excel': 'Export to Excel',
  'Tablas y gráficos': 'Tables and charts',
  'Solo tablas': 'Tables only',
  'Solo gráficos': 'Charts only',
  'Descargar Excel': 'Download Excel',
  'Exportando…': 'Exporting…',
  'No se pudo exportar: {{error}}': 'Could not export: {{error}}',

  // Ajustes 2 — tema configurable por admin
  'Colores de la app': 'App colors',
  'Personaliza el color de acento y los fondos. Aplica a toda la web y la app.':
    'Customize the accent color and backgrounds. Applies to the whole web and app.',
  'Acento (marca)': 'Accent (brand)',
  'Fondo (claro)': 'Background (light)',
  'Superficie (claro)': 'Surface (light)',
  'Fondo (oscuro)': 'Background (dark)',
  'Superficie (oscuro)': 'Surface (dark)',
  'Guardar colores': 'Save colors',
  Restablecer: 'Reset',
  'Orden de páginas': 'Page order',
  'Define en qué orden aparecen las secciones en el menú y en el recorrido guiado.':
    'Sets the order sections appear in the menu and in the guided tour.',
  'Guardar orden': 'Save order',
  'Categoría del sistema (editable por admin)': 'System category (admin editable)',

  // Recibos — ingreso o gasto
  'Toma una foto del ticket o sube una factura y registra el movimiento automáticamente':
    'Take a photo of the receipt or upload an invoice and record the transaction automatically',
  'Registrar ingreso': 'Save income',
  'Ingreso registrado correctamente.': 'Income recorded successfully.',
  'Cuenta donde entró el dinero': 'Account the money went into',
  'Selecciona la cuenta donde entró el dinero': 'Select the account the money went into',

  // Selector de color de tarjeta
  Guardados: 'Saved',
  'Más colores…': 'More colors…',
  Elegir: 'Pick',
  Hex: 'Hex',
  'Vista previa': 'Preview',
  'Usar y guardar': 'Use and save',
  Quitar: 'Remove',

  // Presupuestos
  'Cuánto puedes gastar en cada categoría y cómo vas en el periodo.':
    'How much you can spend per category and how you are doing this period.',
  '+ Nuevo presupuesto': '+ New budget',
  'Crear presupuesto': 'Create budget',
  'Sin presupuestos. Crea uno general o por categoría para ver cuánto llevas gastado.':
    'No budgets yet. Create a general one or one per category to track your spending.',
  'Sin presupuestos configurados.': 'No budgets configured.',
  'General (todas las categorías)': 'General (all categories)',
  General: 'General',
  'Monto máximo': 'Spending limit',
  Periodo: 'Period',
  Diario: 'Daily',
  Semanal: 'Weekly',
  Quincenal: 'Biweekly',
  // 'Mensual' y 'Activo' ya están traducidos más arriba.
  'Se reinicia cada día.': 'Resets every day.',
  'De lunes a domingo.': 'Monday through Sunday.',
  'Del 1 al 15 y del 16 a fin de mes.': 'From the 1st to the 15th, and the 16th to month end.',
  'Del día 1 a fin de mes.': 'From the 1st to month end.',
  'Avisarme al llegar a (%)': 'Alert me at (%)',
  'Avisarme al llegar a': 'Alert me at',
  'Si lo dejas vacío se usa tu umbral general ({{n}}%), configurable en Configuración.':
    'Leave empty to use your general threshold ({{n}}%), configurable in Settings.',
  'Se usa en los presupuestos que no definen su propio umbral. Te avisamos una vez por periodo al cruzarlo, y otra si lo excedes.':
    'Used by budgets without their own threshold. We alert you once per period when you cross it, and again if you go over.',
  'Ver mis presupuestos': 'View my budgets',
  'Avisarme también por correo': 'Also alert me by email',
  'Un correo al día con los presupuestos que cruzaron su límite. Nunca se repite el mismo aviso.':
    'One email a day with the budgets that crossed their limit. The same alert is never repeated.',
  'Al desactivarlo deja de calcularse y de avisarte, sin borrarlo.':
    'Deactivating stops its tracking and alerts without deleting it.',
  Inactivos: 'Inactive',
  'Ya existe un presupuesto para esa categoría.': 'A budget already exists for that category.',
  '¿Eliminar el presupuesto de "{{name}}"?': 'Delete the "{{name}}" budget?',
  'este presupuesto': 'this budget',
  'Te quedan': 'Left',
  'Excedido por': 'Over by',
  'excedido por': 'over by',
  'por revisar': 'to review',
  'avisa al {{n}}%': 'alerts at {{n}}%',
  Gastado: 'Spent',
  Restante: 'Remaining',
  'Dentro del presupuesto': 'Within budget',
  'Cerca del límite': 'Near the limit',
  Excedido: 'Over budget',
  'Plan gratis: máximo {{n}} presupuestos. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} budgets. Upgrade to Premium to add more.',
  'Máx. presupuestos (gratis)': 'Max. budgets (free)',
  // Avisos de presupuesto
  'Llevas {{percent}}% de tu presupuesto de {{name}} ({{spent}} de {{amount}}).':
    'You are at {{percent}}% of your {{name}} budget ({{spent}} of {{amount}}).',
  'Excediste tu presupuesto de {{name}}: llevas {{spent}} de {{amount}}.':
    'You went over your {{name}} budget: {{spent}} of {{amount}}.',
  'tu presupuesto': 'your budget',
  Ver: 'View',
  Entendido: 'Got it',

  // Legal (Términos y Privacidad)
  'Términos y Condiciones': 'Terms and Conditions',
  'Política de Privacidad': 'Privacy Policy',
  'Política de Cookies': 'Cookie Policy',
  'Última actualización: {{date}}': 'Last updated: {{date}}',

  // Términos — encabezados
  'Aceptación de los términos': 'Acceptance of the terms',
  'Qué es (y qué no es) la app': 'What the app is (and is not)',
  'Tu cuenta': 'Your account',
  'Uso aceptable': 'Acceptable use',
  'Sincronización de correo, SMS y notificaciones': 'Email, SMS and notification sync',
  'Planes y pagos': 'Plans and payments',
  'Propiedad intelectual': 'Intellectual property',
  'Limitación de responsabilidad': 'Limitation of liability',
  'Cancelación de tu cuenta': 'Cancelling your account',
  'Cambios a estos términos': 'Changes to these terms',
  'Ley aplicable': 'Governing law',
  Contacto: 'Contact',

  // Términos — párrafos
  'Al crear una cuenta o usar Mi Control de Finanzas Personales ("la app") aceptas estos Términos y Condiciones. Si no estás de acuerdo, no uses la app.':
    'By creating an account or using Mi Control de Finanzas Personales ("the app") you accept these Terms and Conditions. If you do not agree, do not use the app.',
  'La app es una herramienta para llevar el registro y la organización de tus finanzas personales: cuentas, tarjetas, transacciones, presupuestos y reportes.':
    'The app is a tool for tracking and organizing your personal finances: accounts, cards, transactions, budgets and reports.',
  'La app no es un banco, una institución financiera, un asesor financiero ni un intermediario de pagos. No movemos tu dinero, no tenemos acceso a tus contraseñas bancarias y no damos asesoría de inversión. La información que muestra la app depende de los datos que tú capturas o autorizas a sincronizar, y puede contener errores o retrasos.':
    'The app is not a bank, a financial institution, a financial advisor or a payment intermediary. We do not move your money, we do not have access to your bank passwords, and we do not provide investment advice. The information the app shows depends on the data you enter or authorize it to sync, and it may contain errors or delays.',
  'Debes tener al menos 18 años para crear una cuenta. Eres responsable de mantener segura tu contraseña y de toda la actividad que ocurra en tu cuenta.':
    'You must be at least 18 years old to create an account. You are responsible for keeping your password secure and for all activity on your account.',
  'La información que registras (cuentas, tarjetas, montos) debe ser información que tengas derecho a compartir; no uses la app para registrar datos financieros de terceros sin su consentimiento, salvo dentro de un plan familiar compartido que tú mismo administras.':
    'The information you record (accounts, cards, amounts) must be information you have the right to share; do not use the app to record third parties\' financial data without their consent, except within a shared family plan that you manage yourself.',
  'No debes usar la app para actividades ilegales, para intentar acceder a cuentas de otros usuarios sin autorización, ni para interferir con el funcionamiento del servicio.':
    'You must not use the app for illegal activities, to attempt to access other users\' accounts without authorization, or to interfere with the operation of the service.',
  'Las funciones de "Sincronizar correo" (Gmail u Outlook, solo lectura), "Sincronizar SMS" (solo Android) y "Captura por notificaciones" (solo Android) son opcionales y requieren tu autorización explícita. Puedes desactivarlas en cualquier momento desde la app. El tratamiento de estos datos se rige por la Política de Privacidad.':
    'The "Sync email" (Gmail or Outlook, read-only), "Sync SMS" (Android only) and "Notification capture" (Android only) features are optional and require your explicit authorization. You can turn them off at any time from within the app. The handling of this data is governed by the Privacy Policy.',
  'La captura por notificaciones funciona solo si le das a la app el "Acceso a notificaciones" en los ajustes de Android, y solo lee las notificaciones de las apps que tú marcas (por ejemplo, la de tu banco o de una tienda). Puedes quitar ese permiso en cualquier momento desde los ajustes de Android. Los avisos que traen un monto se procesan en nuestro servidor para crear una transacción o un pendiente por confirmar.':
    'Notification capture only works if you grant the app "Notification access" in Android settings, and it only reads notifications from the apps you select (for example, your bank\'s or a store\'s app). You can remove that permission at any time from Android settings. Alerts that include an amount are processed on our server to create a transaction or a pending item to confirm.',
  'Cuando un mismo cargo llega por más de un canal (SMS, correo o notificación), la app descarta el aviso repetido si es seguro que es el mismo movimiento y, si no lo es, lo marca como "Posible duplicado" para que tú decidas. Aun así, revisa las transacciones capturadas automáticamente: pueden contener errores de lectura.':
    'When the same charge arrives through more than one channel (SMS, email or notification), the app discards the repeated alert if it is certain it is the same transaction; otherwise it marks it as "Possible duplicate" so you can decide. Even so, review automatically captured transactions: they may contain reading errors.',
  'La captura por notificaciones depende de tu teléfono: algunos fabricantes (por ejemplo, Xiaomi, Huawei o Samsung) detienen las apps en segundo plano para ahorrar batería. No garantizamos que se capture cada aviso; si falta alguno, puedes registrarlo a mano.':
    'Notification capture depends on your phone: some manufacturers (for example, Xiaomi, Huawei or Samsung) stop background apps to save battery. We do not guarantee that every alert will be captured; if one is missing, you can add it manually.',
  'Mientras la conexión con Gmail esté en modo de prueba ante Google, solo los correos agregados como "usuarios de prueba" en la consola de Google Cloud podrán usar esa función; esta limitación es de Google, no de la app.':
    'While the Gmail connection is in testing mode with Google, only email addresses added as "test users" in the Google Cloud console can use that feature; this limitation comes from Google, not from the app.',
  'Si conectas Google Calendar, la app crea en tu calendario recordatorios de cobros de suscripciones y de pagos de tarjeta. Puedes desconectarlo en cualquier momento desde "Configuración".':
    'If you connect Google Calendar, the app creates reminders in your calendar for subscription charges and card payments. You can disconnect it at any time from "Settings".',
  'La app tiene un plan gratuito y un plan Premium con funciones adicionales. Premium cuesta $107 MXN al mes o $1,037 MXN al año cuando lo contratas en la web; si lo contratas desde Google Play, el precio es el que Google Play muestra en tu país, con impuestos incluidos. El precio final es siempre el que se muestra al momento de pagar. Al suscribirte tienes 7 días de prueba gratis: si cancelas antes de que termine la prueba, no se te cobra.':
    'The app has a free plan and a Premium plan with additional features. Premium costs $107 MXN per month or $1,037 MXN per year when you subscribe on the web; if you subscribe through Google Play, the price is the one Google Play shows in your country, taxes included. The final price is always the one shown at checkout. When you subscribe you get a 7-day free trial: if you cancel before the trial ends, you are not charged.',
  'Los pagos se procesan a través de Stripe (web) o de Google Play (app instalada desde Google Play). Nosotros no vemos ni guardamos el número de tu tarjeta.':
    'Payments are processed through Stripe (web) or Google Play (app installed from Google Play). We never see or store your card number.',
  'La suscripción se renueva automáticamente al final de cada periodo (mensual o anual) hasta que la canceles. Puedes cancelarla en cualquier momento desde "Configuración → Gestionar suscripción" (si la contrataste en Google Play, se cancela desde Google Play y sus reembolsos siguen las políticas de Google); la cancelación surte efecto al terminar el periodo que ya pagaste, y hasta entonces conservas Premium.':
    'The subscription renews automatically at the end of each period (monthly or yearly) until you cancel it. You can cancel at any time from "Settings → Manage subscription" (if you subscribed through Google Play, cancel it from Google Play; refunds follow Google\'s policies); cancellation takes effect at the end of the period you already paid for, and you keep Premium until then.',
  'Podemos cambiar los precios o las funciones incluidas en cada plan. Si un cambio de precio te afecta, te avisaremos antes de tu siguiente renovación para que puedas cancelar si no estás de acuerdo.':
    'We may change prices or the features included in each plan. If a price change affects you, we will notify you before your next renewal so you can cancel if you do not agree.',
  'La app, su diseño, código y marca nos pertenecen. Tú conservas la propiedad de los datos financieros que capturas; nos das permiso únicamente para almacenarlos y procesarlos con el fin de prestarte el servicio.':
    'The app, its design, code and brand belong to us. You retain ownership of the financial data you enter; you grant us permission only to store and process it in order to provide you the service.',
  'La app se ofrece "tal cual", sin garantías de que esté libre de errores o interrupciones. En la medida permitida por la ley, no somos responsables de decisiones financieras que tomes con base en la información mostrada por la app, ni de pérdidas derivadas de errores de sincronización, del correo, del SMS o de las notificaciones, o de fallas de servicios de terceros (Google, Microsoft, Stripe, Supabase, tu banco).':
    'The app is provided "as is", without guarantees that it is free of errors or interruptions. To the extent permitted by law, we are not responsible for financial decisions you make based on information shown by the app, nor for losses arising from sync errors, email, SMS or notifications, or failures of third-party services (Google, Microsoft, Stripe, Supabase, your bank).',
  'Puedes dejar de usar la app y solicitar la eliminación de tu cuenta y tus datos en cualquier momento escribiendo a {{email}}. Podemos suspender o cancelar cuentas que incumplan estos términos.':
    'You can stop using the app and request deletion of your account and data at any time by writing to {{email}}. We may suspend or cancel accounts that violate these terms.',
  'Podemos actualizar estos términos ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.':
    'We may update these terms from time to time. We will publish any changes on this same page with the corresponding update date.',
  'Estos términos se rigen por las leyes de México, sin perjuicio de los derechos que la legislación de tu país de residencia te reconozca como consumidor.':
    'These terms are governed by the laws of Mexico, without prejudice to the rights that the laws of your country of residence grant you as a consumer.',
  '¿Dudas sobre estos términos? Escríbenos a {{email}}.':
    'Questions about these terms? Write to us at {{email}}.',

  // Privacidad — encabezados
  'Quiénes somos': 'Who we are',
  'Qué datos recopilamos': 'What data we collect',
  'Uso de datos obtenidos mediante las APIs de Google': 'Use of data obtained through Google APIs',
  'Cómo usamos tus datos': 'How we use your data',
  'Con quién compartimos tus datos': 'Who we share your data with',
  'Retención y eliminación de datos': 'Data retention and deletion',
  Seguridad: 'Security',
  'Tus derechos': 'Your rights',
  'Menores de edad': 'Minors',
  'Cambios a esta política': 'Changes to this policy',
  'Cookies y almacenamiento local': 'Cookies and local storage',

  // Privacidad — párrafos
  'Mi Control de Finanzas Personales ("la app", "nosotros") es una aplicación de finanzas personales que te ayuda a organizar ingresos, gastos, cuentas, tarjetas y presupuestos. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos.':
    'Mi Control de Finanzas Personales ("the app", "we") is a personal finance app that helps you organize income, expenses, accounts, cards and budgets. This policy explains what data we collect, how we use it, and what rights you have over it.',
  'Datos de cuenta: nombre, correo electrónico y, si inicias sesión con Google, tu nombre y correo asociados a tu cuenta de Google.':
    'Account data: name, email address, and, if you sign in with Google, the name and email associated with your Google account.',
  'Datos financieros que capturas tú mismo: cuentas, tarjetas, líneas de crédito, transacciones, categorías, presupuestos y montos, ya sea escritos a mano, importados desde un archivo, o extraídos de un recibo/factura que fotografías o subes.':
    'Financial data you enter yourself: accounts, cards, credit lines, transactions, categories, budgets and amounts, whether typed in by hand, imported from a file, or extracted from a receipt/invoice you photograph or upload.',
  'Datos de sincronización opcional por correo: si activas "Sincronizar correo" y conectas tu cuenta de Gmail, la app lee únicamente los mensajes que coinciden con reglas de remitente que tú configuras (por ejemplo, notificaciones de tu banco o de servicios como Xsolla/EBANX), extrae de ellos los datos de una transacción (monto, fecha, concepto) y no guarda el contenido completo del correo.':
    'Optional email sync data: if you turn on "Sync email" and connect your Gmail account, the app only reads messages that match sender rules you configure (for example, notifications from your bank or services like Xsolla/EBANX), extracts transaction data from them (amount, date, description), and does not store the full email content.',
  'Datos de sincronización opcional por SMS (solo Android): si activas "Sincronizar SMS", la app lee los mensajes de texto entrantes para detectar avisos de transacciones bancarias y extraer monto, fecha y concepto; no se sube ni se comparte el contenido completo del SMS ni los mensajes que no correspondan a movimientos financieros.':
    'Optional SMS sync data (Android only): if you turn on "Sync SMS", the app reads incoming text messages to detect bank transaction alerts and extract amount, date and description; the full SMS content is not uploaded or shared, nor are messages that are not financial transactions.',
  'Datos de sincronización opcional por Outlook: si conectas tu cuenta de Microsoft (Outlook/Hotmail) en "Sincronizar correo", la app la usa con permiso de solo lectura, con las mismas reglas de remitente y el mismo tratamiento que Gmail.':
    'Optional Outlook sync data: if you connect your Microsoft account (Outlook/Hotmail) in "Sync email", the app uses it with read-only permission, with the same sender rules and the same handling as Gmail.',
  'Datos de Google Calendar: si conectas Google Calendar, la app crea eventos de recordatorio (cobros de suscripciones y pagos de tarjeta) en tu calendario; no lee tus otros eventos.':
    'Google Calendar data: if you connect Google Calendar, the app creates reminder events (subscription charges and card payments) in your calendar; it does not read your other events.',
  'Datos de pago: si contratas Premium, el pago lo procesa Stripe o Google Play. Nosotros solo guardamos el identificador de cliente de Stripe o el token de compra de Google Play y el estado de tu suscripción (plan, vigencia, periodo de prueba); nunca vemos ni guardamos el número de tu tarjeta.':
    'Payment data: if you purchase Premium, the payment is processed by Stripe or Google Play. We only store your Stripe customer ID or Google Play purchase token and your subscription status (plan, validity, trial period); we never see or store your card number.',
  'Datos de uso: información técnica básica para el funcionamiento de la app (por ejemplo, idioma preferido, tema claro/oscuro, y registros de error para poder corregir fallas).':
    'Usage data: basic technical information needed to run the app (for example, preferred language, light/dark theme, and error logs so we can fix bugs).',
  'El uso y la transferencia de información recibida desde las APIs de Google por parte de Mi Control de Finanzas Personales se ajustará a la Política de Datos de Usuario de los Servicios de API de Google (Google API Services User Data Policy), incluidos los requisitos de Uso Limitado ("Limited Use").':
    "Mi Control de Finanzas Personales's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
  'En concreto: el acceso de solo lectura a Gmail (scope gmail.readonly) se usa exclusivamente para detectar transacciones financieras en los correos que coinciden con las reglas de remitente que tú configuras dentro de la app. No usamos estos datos para publicidad, no los vendemos, no los compartimos con terceros salvo lo necesario para operar el servicio (ver "Con quién compartimos tus datos"), y ningún humano lee tu correo salvo que sea estrictamente necesario para dar soporte técnico que tú mismo solicites, para cumplir la ley, o para investigar un uso indebido.':
    'Specifically: read-only Gmail access (the gmail.readonly scope) is used exclusively to detect financial transactions in emails that match the sender rules you configure inside the app. We do not use this data for advertising, we do not sell it, and we do not share it with third parties except as necessary to operate the service (see "Who we share your data with"); no human reads your email unless strictly necessary to provide technical support you request, to comply with the law, or to investigate misuse.',
  'El permiso de Google Calendar (scope calendar.events) se usa exclusivamente para crear, actualizar y eliminar los eventos de recordatorio que la propia app genera (cobros de suscripciones y pagos de tarjeta); no leemos ni modificamos los demás eventos de tu calendario. Los datos recibidos de Gmail y de Google Calendar no se usan para desarrollar, mejorar ni entrenar modelos de inteligencia artificial o de aprendizaje automático, ni generalizados ni personalizados.':
    'The Google Calendar permission (the calendar.events scope) is used exclusively to create, update and delete the reminder events that the app itself generates (subscription charges and card payments); we do not read or modify any other events in your calendar. Data received from Gmail and Google Calendar is not used to develop, improve or train artificial intelligence or machine learning models, whether generalized or personalized.',
  'Puedes revocar el acceso de la app a tu cuenta de Google en cualquier momento desde la configuración de tu cuenta de Google (myaccount.google.com/permissions) o desde la sección "Sincronizar correo" dentro de la app.':
    'You can revoke the app\'s access to your Google account at any time from your Google account settings (myaccount.google.com/permissions) or from the "Sync email" section inside the app.',
  'Usamos tus datos para operar la app: mostrar tus saldos, transacciones, reportes y presupuestos; enviarte notificaciones relacionadas con tu cuenta; y responder a tus comentarios o solicitudes de soporte.':
    'We use your data to run the app: showing your balances, transactions, reports and budgets; sending you notifications related to your account; and responding to your feedback or support requests.',
  'No usamos tus datos financieros para publicidad ni los vendemos a terceros.':
    'We do not use your financial data for advertising, nor do we sell it to third parties.',
  'Usamos Supabase como proveedor de infraestructura (base de datos, autenticación y funciones del servidor) para operar la app; Supabase procesa los datos en nuestro nombre bajo sus propias medidas de seguridad, y no los usa para sus propios fines.':
    'We use Supabase as our infrastructure provider (database, authentication and server functions) to run the app; Supabase processes data on our behalf under its own security measures, and does not use it for its own purposes.',
  'Cuando inicias sesión con Google, o conectas Gmail, compartimos información con Google únicamente en la medida necesaria para autenticarte o para leer los correos que tú autorizas, conforme a esta política.':
    'When you sign in with Google, or connect Gmail, we share information with Google only to the extent necessary to authenticate you or to read the emails you authorize, in accordance with this policy.',
  'Si conectas Outlook, compartimos información con Microsoft únicamente en la medida necesaria para leer los correos que tú autorizas.':
    'If you connect Outlook, we share information with Microsoft only to the extent necessary to read the emails you authorize.',
  'Si contratas Premium, Stripe o Google Play reciben los datos necesarios para cobrarte (correo, datos de la tarjeta o del medio de pago que capturas directamente en su página) y los tratan conforme a su propia política de privacidad.':
    'If you purchase Premium, Stripe or Google Play receive the data needed to charge you (email, and the card or payment method details you enter directly on their page) and handle it under their own privacy policies.',
  'No compartimos tus datos financieros con anunciantes ni los vendemos a terceros.':
    'We do not share your financial data with advertisers, nor do we sell it to third parties.',
  'Conservamos tus datos mientras tu cuenta esté activa. Puedes exportar tus transacciones a Excel en cualquier momento desde la app.':
    'We keep your data while your account is active. You can export your transactions to Excel at any time from the app.',
  'Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la app (Configuración → Eliminar mi cuenta). El borrado es inmediato y definitivo: se eliminan tus movimientos, cuentas, tarjetas, presupuestos, reglas y conexiones de correo o calendario, se revoca el acceso a Google y se cancela tu suscripción Premium si la tienes. También puedes pedirlo escribiéndonos a {{email}}.':
    'You can delete your account and all your data at any time from the app (Settings → Delete my account). Deletion is immediate and permanent: your transactions, accounts, cards, budgets, rules and email or calendar connections are deleted, Google access is revoked and your Premium subscription is canceled if you have one. You can also request it by writing to us at {{email}}.',
  'Cómo eliminar tu cuenta': 'How to delete your account',
  'Tus datos se transmiten mediante conexiones cifradas (HTTPS) y se almacenan con controles de acceso a nivel de fila (row-level security), de modo que cada usuario solo puede ver su propia información o la de una familia/cuenta compartida a la que fue invitado explícitamente.':
    'Your data is transmitted over encrypted connections (HTTPS) and stored with row-level security access controls, so each user can only see their own information or that of a shared family/account they were explicitly invited to.',
  'Puedes acceder, corregir, exportar o solicitar la eliminación de tus datos personales en cualquier momento, ya sea desde la propia app (sección "Configuración") o escribiéndonos a {{email}}.':
    'You can access, correct, export or request deletion of your personal data at any time, either from within the app itself ("Settings" section) or by writing to us at {{email}}.',
  'La app no está dirigida a menores de 18 años y no recopilamos intencionalmente datos de menores.':
    'The app is not directed at anyone under 18 and we do not knowingly collect data from minors.',
  'Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.':
    'We may update this policy from time to time. We will publish any changes on this same page with the corresponding update date.',
  'La app no usa cookies de rastreo, publicidad ni analítica. Solo guarda en tu navegador lo necesario para funcionar (tu sesión y tus preferencias). Los detalles están en la Política de Cookies.':
    'The app does not use tracking, advertising or analytics cookies. It only stores in your browser what it needs to work (your session and your preferences). Details are in the Cookie Policy.',
  'Ver la Política de Cookies': 'View the Cookie Policy',

  // Política de Cookies
  'Qué guardamos en tu navegador': 'What we store in your browser',
  'Sitios de terceros': 'Third-party sites',
  'Cómo borrar estos datos': 'How to delete this data',
  'Mi Control de Finanzas Personales no usa cookies propias, ni cookies de rastreo, publicidad o analítica. Tampoco usamos herramientas que sigan lo que haces en otros sitios.':
    'Mi Control de Finanzas Personales does not use its own cookies, nor tracking, advertising or analytics cookies. We also do not use tools that follow what you do on other sites.',
  'Para funcionar, la app guarda algunos datos en el almacenamiento local de tu navegador (localStorage y sessionStorage), que no se envían a otros sitios:':
    'To work, the app stores some data in your browser\'s local storage (localStorage and sessionStorage), which is not sent to other sites:',
  'Tu sesión: el token de inicio de sesión, para que no tengas que volver a entrar cada vez que abres la app.':
    'Your session: the sign-in token, so you do not have to sign in again every time you open the app.',
  'Tus preferencias: tema claro/oscuro, idioma, tipo de gráficas, si ocultas los montos y otras opciones de la app.':
    'Your preferences: light/dark theme, language, chart type, whether you hide amounts, and other app options.',
  'El progreso del tutorial y de las novedades que ya viste.':
    'Your progress in the tutorial and the "What\'s new" items you have already seen.',
  'Un dato temporal mientras conectas tu correo o tu calendario, que se borra al cerrar la pestaña.':
    'A temporary value while you connect your email or calendar, which is deleted when you close the tab.',
  'Todo esto es necesario para que la app funcione, así que no pedimos consentimiento para guardarlo. No lo usamos para identificarte fuera de la app ni para publicidad.':
    'All of this is necessary for the app to work, so we do not ask for consent to store it. We do not use it to identify you outside the app or for advertising.',
  'Cuando pagas Premium en la web te llevamos a la página de pago de Stripe (en la app de Google Play el pago lo hace Google Play), y cuando conectas Google o Microsoft, a sus páginas de inicio de sesión. Esos sitios pueden usar sus propias cookies, que se rigen por sus políticas de privacidad, no por esta.':
    'When you pay for Premium on the web we send you to Stripe\'s checkout page (in the Google Play app, Google Play handles the payment), and when you connect Google or Microsoft, to their sign-in pages. Those sites may use their own cookies, which are governed by their privacy policies, not this one.',
  'Al cerrar sesión se borra tu sesión. Para borrar todo lo demás, elimina los datos de este sitio desde la configuración de tu navegador; ten en cuenta que perderás tus preferencias y tendrás que volver a iniciar sesión.':
    'Signing out deletes your session. To delete everything else, clear this site\'s data from your browser settings; keep in mind you will lose your preferences and will need to sign in again.',
  'Si en el futuro usamos cookies que no sean necesarias (por ejemplo, de analítica), actualizaremos esta página y te pediremos tu consentimiento antes de usarlas.':
    'If in the future we use non-essential cookies (for example, for analytics), we will update this page and ask for your consent before using them.',

  // Página 404
  'Página no encontrada': 'Page not found',
  'La página que buscas no existe o cambió de dirección.': 'The page you are looking for does not exist or has moved.',
  'Ir al Resumen': 'Go to Summary',

  '¿Dudas sobre esta política? Escríbenos a {{email}}.':
    'Questions about this policy? Write to us at {{email}}.',

  // Ajustes 6 — panel de periodo pagado
  'Periodo pagado': 'Period paid',
  'Gasto acumulado del periodo siguiente:': 'Spending accrued for next period:',
  pagado: 'paid',

  // Ajustes 6 — tutorial guiado y novedades
  '¡Bienvenido a {{app}}!': 'Welcome to {{app}}!',
  'Un vistazo rápido a lo que puedes hacer aquí. Puedes saltarte esto y consultarlo después con el botón de ayuda de cada sección.':
    "A quick look at what you can do here. You can skip this and check it later with each section's help button.",
  Anterior: 'Back',
  Siguiente: 'Next',
  Omitir: 'Skip',
  Empezar: 'Get started',
  'Ayuda de esta sección': 'Help for this section',
  Novedades: 'What’s new',
  'No hay novedades por ahora.': 'No news yet.',
  'Ver anteriores ({{n}})': 'Show older ({{n}})',

  // Conciliación (comparador de estados de cuenta)
  Conciliación: 'Reconciliation',
  'Compara el estado de cuenta del banco con lo que registraste.':
    "Compare the bank statement against what you recorded.",
  'Tarjeta o cuenta': 'Card or account',
  'Selecciona…': 'Select…',
  'Estado de cuenta (PDF o imagen)': 'Statement (PDF or image)',
  Comparar: 'Compare',
  'Analizando…': 'Analyzing…',
  'El estado de cuenta parece ser de otra tarjeta/cuenta (termina en {{last4}}). Revisa que elegiste la correcta.':
    'The statement looks like it belongs to another card/account (ending in {{last4}}). Check that you picked the right one.',
  'Tolerancia de monto': 'Amount tolerance',
  'Días de margen': 'Days of leeway',
  '{{lines}} movimientos en el estado de cuenta · comparando contra {{name}} ({{currency}})':
    '{{lines}} movements in the statement · comparing against {{name}} ({{currency}})',
  'Comparando…': 'Comparing…',
  'Total estado de cuenta:': 'Statement total:',
  'Total registrado:': 'Recorded total:',
  'Diferencia:': 'Difference:',
  'En el estado de cuenta, no en la app': 'In the statement, not in the app',
  'Nada 🎉': 'Nothing 🎉',
  'pago a tarjeta — regístralo desde Transacciones':
    'card payment — record it from Transactions',
  'meses sin intereses': 'installments',
  'Agregar seleccionadas': 'Add selected',
  'Monto distinto': 'Different amount',
  'estado de cuenta': 'statement',
  app: 'app',
  'En la app, no en el estado de cuenta': 'In the app, not in the statement',
  Coinciden: 'Match',
  'Guardar conciliación': 'Save reconciliation',
  'Conciliación guardada.': 'Reconciliation saved.',
  'Agregadas: {{added}} · Ya existían: {{existed}} · Con error: {{failed}}':
    'Added: {{added}} · Already existed: {{existed}} · Errors: {{failed}}',
  'Conciliaciones guardadas': 'Saved reconciliations',
  'Aún no guardas ninguna.': "You haven't saved any yet.",
  'Cuenta/tarjeta eliminada': 'Deleted account/card',
  'Conciliación con estados de cuenta': 'Statement reconciliation',
  'Captura por notificaciones':
    'Notification capture',
  'Registra solos los cargos que te avisan las apps de tu banco, wallet o tiendas. Disponible solo en la app de Android.':
    'Automatically records the charges your bank, wallet or shopping apps notify you about. Available only in the Android app.',
  '📵 Apple no permite que las apps lean las notificaciones de otras apps. En iPhone usa "Sincronizar correo" o "Importar" tu estado de cuenta.':
    '📵 Apple doesn\'t allow apps to read other apps\' notifications. On iPhone use "Sync email" or "Import" your statement.',
  'Esta función solo está disponible en la app instalada de Android.':
    'This feature is only available in the installed Android app.',
  '1. Acceso a notificaciones':
    '1. Notification access',
  '✅ Acceso concedido.':
    '✅ Access granted.',
  'Android pide activar este permiso a mano: se abrirá Ajustes, busca esta app y activa "Permitir acceso a notificaciones".':
    'Android requires turning this permission on manually: Settings will open, find this app and enable "Allow notification access".',
  'Dar acceso a notificaciones':
    'Grant notification access',
  'Privacidad: solo se leen las apps que marques abajo y solo se envían los avisos que traen un monto. El texto de la notificación no se guarda; solo el movimiento que se detecte.':
    'Privacy: only the apps you check below are read, and only notifications with an amount are sent. The notification text is not stored; only the detected transaction.',
  '2. Apps que se escuchan':
    '2. Apps to listen to',
  'Buscar app':
    'Search app',
  'Cargando apps…':
    'Loading apps…',
  'Fintech':
    'Fintech',
  'Wallet':
    'Wallet',
  '3. Captura automática':
    '3. Automatic capture',
  '✅ Activada para {{n}} apps.':
    '✅ Enabled for {{n}} apps.',
  'Actívala para que los cargos se registren solos, aun con la app cerrada.':
    'Turn it on so charges are recorded automatically, even with the app closed.',
  'Si el mismo cargo llega también por SMS o correo, se registra una sola vez. Los de apps de compras entran como pendientes. En Xiaomi, Huawei, Oppo y similares permite el "inicio automático" y quita la optimización de batería, o el sistema apaga la captura.':
    'If the same charge also arrives by SMS or email, it is recorded only once. Charges from shopping apps come in as pending. On Xiaomi, Huawei, Oppo and similar phones, allow "autostart" and disable battery optimization, or the system will stop the capture.',
  'Captura de notificaciones desactivada.':
    'Notification capture disabled.',
  'Marca al menos una app (tu banco, por ejemplo) antes de activar.':
    'Check at least one app (your bank, for example) before enabling.',
  'Captura activada. Los cargos que te avisen esas apps se registrarán solos.':
    'Capture enabled. Charges those apps notify you about will be recorded automatically.',
  'Captura activada. Falta darle a la app "Acceso a notificaciones" en Ajustes.':
    'Capture enabled. You still need to give the app "Notification access" in Settings.',
  'Registrado':
    'Recorded',
  'Unido a un cargo que ya existía':
    'Merged into an existing charge',
  'Posible duplicado, por revisar':
    'Possible duplicate, needs review',
  'Últimos avisos recibidos':
    'Latest notices received',
  'Aún no llega ninguno.':
    'None received yet.',
  'Cuenta por defecto':
    'Default account',
  'Según la terminación del aviso':
    'Based on the card/account ending in the notice',
  'Categoría fija (opcional)':
    'Fixed category (optional)',
  'Adivinar por el texto':
    'Guess from the text',
  'Es una app de compras (sus cargos entran pendientes y aportan el comercio)':
    'It\'s a shopping app (its charges come in as pending and provide the merchant)',
  'La cuenta por defecto se usa cuando el aviso no menciona la terminación de tu tarjeta o cuenta (por ejemplo, Mercado Pago).':
    'The default account is used when the notice doesn\'t mention your card or account ending (e.g. Mercado Pago).',
  'Posible duplicado':
    'Possible duplicate',
  'Es duplicado':
    'It\'s a duplicate',
  'Son distintos':
    'They\'re different',
  'Parecido a "{{concept}}" del {{date}}':
    'Similar to "{{concept}}" from {{date}}',
  'Recibido por: {{channels}}':
    'Received via: {{channels}}',
  'Notificación {{app}}':
    '{{app}} notification',
  'Duplicado de otro aviso (SMS/correo/notificación)':
    'Duplicate of another notice (SMS/email/notification)',
  'Datos de captura opcional por notificaciones (solo Android): si activas "Captura por notificaciones" y le das a la app el "Acceso a notificaciones" de Android, la app lee únicamente las notificaciones de las apps que tú marcas (por ejemplo, la de tu banco) y solo envía al servidor las que traen un monto, para extraer monto, fecha, comercio y terminación de tarjeta; el texto de la notificación no se guarda y las notificaciones de otras apps no se leen.':
    'Optional notification capture data (Android only): if you enable "Notification capture" and grant the app Android\'s "Notification access", the app reads only the notifications of the apps you check (for example, your bank\'s) and only sends to the server those that contain an amount, to extract amount, date, merchant and card ending; the notification text is not stored and notifications from other apps are not read.',
  'Si activaste todo y aun así no ves nada aquí después de un cargo real, el aviso ni siquiera llegó al teléfono a tiempo — revisa la guía de arriba.':
    'If you turned everything on and still see nothing here after a real charge, the notice never even reached the phone in time — check the guide above.',
  '🔧 ¿No te está funcionando?':
    '🔧 Not working for you?',
  '▲ Ocultar':
    '▲ Hide',
  '▼ Ver guía':
    '▼ See guide',
  'Si ya diste el permiso y marcaste tu banco pero un cargo real no aparece, casi siempre es el propio teléfono cerrando la app en segundo plano para "ahorrar batería". Busca tu marca y sigue los pasos.':
    'If you already granted the permission and checked your bank but a real charge doesn\'t show up, it\'s almost always the phone itself closing the app in the background to "save battery". Find your brand and follow the steps.',
  'Xiaomi, Redmi, POCO (MIUI o HyperOS)':
    'Xiaomi, Redmi, POCO (MIUI or HyperOS)',
  'Ajustes del teléfono → Aplicaciones → Gestionar aplicaciones → busca esta app → Ahorro de batería → elige "Sin restricciones".':
    'Phone Settings → Apps → Manage apps → find this app → Battery saver → choose "No restrictions".',
  'En esa misma pantalla, activa "Inicio automático".':
    'On that same screen, turn on "Autostart".',
  'Abre las apps recientes (botón cuadrado), mantén presionada la tarjeta de esta app hasta que aparezca un candado, y actívalo para que no se cierre sola.':
    'Open recent apps (square button), long-press this app\'s card until a lock icon appears, and turn it on so it doesn\'t get closed on its own.',
  'Si después de esto sigue sin registrar nada: desinstala la app y vuelve a instalarla. A veces el sistema deja el permiso en un estado raro que solo se arregla reinstalando.':
    'If it still records nothing after this: uninstall the app and reinstall it. Sometimes the system leaves the permission in a stuck state that only reinstalling fixes.',
  'Huawei, Honor (EMUI o MagicOS)':
    'Huawei, Honor (EMUI or MagicOS)',
  'Ajustes → Batería → Inicio de apps → busca esta app y desactiva la gestión automática.':
    'Settings → Battery → App launch → find this app and turn off automatic management.',
  'Activa a mano las tres opciones que aparecen: "Inicio automático", "Inicio secundario" y "Ejecutar en segundo plano".':
    'Manually turn on the three options that appear: "Auto-launch", "Secondary launch", and "Run in background".',
  'Oppo, Realme, OnePlus (ColorOS)':
    'Oppo, Realme, OnePlus (ColorOS)',
  'Ajustes → Batería → Uso de batería por app → busca esta app → permite "Actividad en segundo plano".':
    'Settings → Battery → App battery usage → find this app → allow "Background activity".',
  'Ajustes → Administración de apps (o "Inicio automático de apps") → actívalo para esta app.':
    'Settings → App management (or "App auto-launch") → turn it on for this app.',
  'Samsung (One UI)':
    'Samsung (One UI)',
  'Mantén presionado el ícono de la app → Info de la app → Batería → elige "Sin restricciones".':
    'Long-press the app icon → App info → Battery → choose "Unrestricted".',
  'Ajustes → Cuidado del dispositivo → Batería → Límites de uso en segundo plano → confirma que esta app NO esté en "Apps que no se usan" ni en "Apps en reposo profundo".':
    'Settings → Device care → Battery → Background usage limits → make sure this app is NOT in "Unused apps" or "Deep sleeping apps".',
  'Otra marca':
    'Other brand',
  'Busca en Ajustes algo como "Optimización de batería" o "Ahorro de energía" y pon esta app en "Sin restricciones" o "No optimizar".':
    'Look in Settings for something like "Battery optimization" or "Power saving" and set this app to "No restrictions" or "Don\'t optimize".',
  'Revisa que no tenga activado ningún modo de "suspender apps no usadas" para ella.':
    'Check that no "suspend unused apps" mode is enabled for it.',
  '¿Sigue sin funcionar después de todo esto? Mientras tanto, esos cargos no se pierden: sigue registrándolos con "Importar" o capturándolos a mano, y cuando puedas cuéntanos la marca y modelo de tu teléfono para revisarlo.':
    'Still not working after all this? In the meantime those charges aren\'t lost: keep recording them with "Import" or by hand, and when you can, tell us your phone\'s brand and model so we can look into it.',
  'Ver todas las preguntas frecuentes de esta función →':
    'See all FAQs for this feature →',
  '¿Por qué? Ver preguntas frecuentes →':
    'Why? See FAQs →',
  'Preguntas frecuentes':
    'FAQ',
  'Respuestas rápidas y guías paso a paso para sacarle provecho a la app.':
    'Quick answers and step-by-step guides to get the most out of the app.',
  '▼ Mostrar':
    '▼ Show',
  'Registra solos los cargos que te avisan las apps de tu banco, wallet o tiendas. Solo en Android.':
    'Automatically records the charges your bank, wallet or shopping apps notify you about. Android only.',
  '¿Qué es y cómo funciona?':
    'What is it and how does it work?',
  'Cuando tu banco o una app como Mercado Pago te avisa de una compra con una notificación en el teléfono, la app puede leer ese aviso y registrar el movimiento sola, sin que tengas que abrirla ni capturarlo a mano. Es el mismo principio que la captura por SMS, pero para bancos y fintechs que ya no mandan mensajes de texto y solo avisan por su propia app.':
    'When your bank or an app like Mercado Pago notifies you of a purchase with a phone notification, the app can read that notice and record the transaction on its own, without you opening it or entering it by hand. It is the same idea as SMS capture, but for banks and fintechs that no longer send text messages and only notify through their own app.',
  '¿Cómo la activo?':
    'How do I turn it on?',
  '1. Entra a "Captura por notificaciones" desde el menú.':
    '1. Go to "Notification capture" from the menu.',
  '2. En "Acceso a notificaciones", dale a "Dar acceso a notificaciones". Se abre una pantalla de Ajustes de Android: busca esta app en la lista y actívala ahí.':
    '2. Under "Notification access", tap "Grant notification access". An Android Settings screen opens: find this app in the list and turn it on there.',
  '3. En "Apps que se escuchan", marca tu banco, tu wallet o las tiendas cuyos avisos quieres capturar. Los bancos conocidos ya vienen premarcados.':
    '3. Under "Apps to listen to", check your bank, wallet or the shops whose notices you want captured. Known banks come pre-checked.',
  '4. Dale a "Activar captura automática".':
    '4. Tap "Enable automatic capture".',
  'Ojo: en la mayoría de los teléfonos esto no basta. Revisa la pregunta "No se registró un cargo" de abajo: casi todos necesitan un ajuste extra de batería.':
    'Heads up: on most phones this is not enough. See the "A charge was not recorded" question below: almost all of them need an extra battery setting.',
  '¿Qué datos se leen y cuáles se guardan?':
    'What data is read and what is stored?',
  'Solo se leen las notificaciones de las apps que tú marques, y solo se envían al servidor las que traen un monto.':
    'Only notifications from the apps you check are read, and only those with an amount are sent to the server.',
  'No se leen las de apps que no marcaste (WhatsApp, redes sociales…) ni los avisos sin monto.':
    'Notifications from apps you did not check (WhatsApp, social media…) and notices without an amount are not read.',
  'Se guarda el movimiento detectado: monto, fecha, comercio y de qué app vino. El texto original de la notificación no se guarda.':
    'The detected transaction is stored: amount, date, merchant and which app it came from. The original notification text is not stored.',
  '¿Qué pasa si el mismo cargo llega por notificación, SMS y correo?':
    'What if the same charge arrives by notification, SMS and email?',
  'La app compara monto, moneda y hora entre los tres canales:':
    'The app compares amount, currency and time across the three channels:',
  'Si coincide todo y llegan con menos de 10 minutos de diferencia, se registra una sola vez y se juntan los datos (el banco aporta la cuenta, la tienda aporta el comercio).':
    'If everything matches and they arrive less than 10 minutes apart, it is recorded once and the data is combined (the bank provides the account, the shop provides the merchant).',
  'Si coincide pero con más diferencia de tiempo o entre cuentas distintas, se registra igual pero marcado como "Posible duplicado" en Transacciones, con botones para decir si es el mismo cargo o no.':
    'If it matches but with a larger time gap or across different accounts, it is still recorded but flagged as "Possible duplicate" in Transactions, with buttons to say whether it is the same charge or not.',
  'Dos avisos de la misma app con el mismo monto (dos cafés del mismo precio) nunca se fusionan: se registran como dos movimientos.':
    'Two notices from the same app with the same amount (two coffees at the same price) are never merged: they are recorded as two transactions.',
  'No se registró un cargo. ¿Qué hago?':
    'A charge was not recorded. What do I do?',
  'Para saber si es el teléfono o algo más: en "Captura por notificaciones" mira "Últimos avisos recibidos". Si está vacío después de un cargo real, el aviso ni siquiera llegó al servidor: es un ajuste del teléfono, no un error de la app.':
    'To tell whether it is the phone or something else: in "Notification capture" look at "Latest notices received". If it is empty after a real charge, the notice never even reached the server: it is a phone setting, not an app error.',
  'Ya hice los ajustes de batería y sigue sin funcionar':
    'I did the battery settings and it still does not work',
  'El truco que más veces lo resuelve, incluso después de ajustar la batería, es desinstalar la app y volver a instalarla: fuerza al sistema a registrar el permiso desde cero. Mientras tanto, esos cargos no se pierden: puedes seguir registrándolos con "Importar" o capturándolos a mano.':
    'The trick that fixes it most often, even after adjusting the battery, is to uninstall the app and install it again: it forces the system to register the permission from scratch. In the meantime those charges are not lost: you can keep recording them with "Import" or by hand.',
  '¿Funciona en iPhone?':
    'Does it work on iPhone?',
  'No. Por un lado, Apple no permite que una app lea las notificaciones de otras apps. Por otro, en iPhone solo se pueden instalar apps desde la App Store y esta app todavía no está publicada ahí, así que no hay una app que descargar para iPhone.':
    'No. First, Apple does not allow an app to read notifications from other apps. Second, iPhone only allows installing apps from the App Store and this app is not published there yet, so there is no app to download for iPhone.',
  'Lo que sí puedes hacer en iPhone es usar la versión web desde Safari (puedes agregarla a tu pantalla de inicio con Compartir → "Agregar a inicio") y, desde ahí, usar "Sincronizar correo" o "Importar" tu estado de cuenta.':
    'What you can do on iPhone is use the web version from Safari (you can add it to your home screen with Share → "Add to Home Screen") and, from there, use "Sync email" or "Import" your statement.',
  '¿Y las apps de compras, como Amazon o Rappi?':
    'What about shopping apps, like Amazon or Rappi?',
  'Sus avisos siempre entran como pendientes, porque por sí solos no confirman que el cobro ya se hizo. Si después llega el aviso del banco por ese mismo monto, se juntan: el banco aporta la cuenta y la tienda aporta el nombre del comercio.':
    'Their notices always come in as pending, because on their own they do not confirm the charge went through. If the bank notice for that same amount arrives later, they are merged: the bank provides the account and the shop provides the merchant name.',
  '¿Puedo cambiar la cuenta o la categoría con la que entra un cargo?':
    'Can I change the account or category a charge comes in with?',
  'Sí. En "Apps que se escuchan", dale a "Ajustes" junto a cualquier app marcada para fijar una cuenta por defecto (para cuando el aviso no menciona la terminación de tu tarjeta) y una categoría fija.':
    'Yes. Under "Apps to listen to", tap "Settings" next to any checked app to set a default account (for when the notice does not mention your card ending) and a fixed category.',
  '¿No encuentras lo que buscas? Cada sección de la app tiene un botón "?" con una explicación corta de lo que hace.':
    'Cannot find what you are looking for? Each section of the app has a "?" button with a short explanation of what it does.',
  'Volver al resumen':
    'Back to summary',
  // Admin — funciones configurables y secciones ocultas
  'Cuentas y crédito':
    'Accounts and credit',
  'Captura de movimientos':
    'Transaction capture',
  'Análisis':
    'Analysis',
  'Apartados (cajitas)':
    'Pockets',
  'Líneas de crédito':
    'Credit lines',
  'Cuentas en otras monedas':
    'Accounts in other currencies',
  'Subpartidas':
    'Line items',
  'Importar estados de cuenta':
    'Import statements',
  'Suscripciones':
    'Subscriptions',
  'Cobro automático de suscripciones':
    'Automatic subscription charges',
  'Categorías propias':
    'Custom categories',
  'Selector de periodo en Resumen':
    'Period selector in Summary',
  'Selector de periodo en Movimientos':
    'Period selector in Transactions',
  'Recordatorios en Google Calendar':
    'Google Calendar reminders',
  'Marca qué funciones requieren Premium y el límite del plan gratis (0 = ilimitado).':
    'Choose which features require Premium and the free plan limit (0 = unlimited).',
  'Límite gratis':
    'Free limit',
  '/mes':
    '/month',
  'total':
    'total',
  'Oculta':
    'Hidden',
  'Ocultar':
    'Hide',
  'Orden y visibilidad de páginas':
    'Page order and visibility',
  'Define en qué orden aparecen las secciones en el menú y en el recorrido guiado, y oculta las que no quieras mostrar. Los admins siguen viendo las secciones ocultas.':
    'Set the order of sections in the menu and guided tour, and hide the ones you do not want to show. Admins still see hidden sections.',
  'Plan gratis: máximo {{n}} líneas de crédito. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} credit lines. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} suscripciones. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} subscriptions. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} categorías propias. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} custom categories. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} apartados. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} pockets. Upgrade to Premium to add more.',
  'Plan gratis: llegaste al límite de {{n}} importaciones este mes. Actualiza a Premium para importar más.':
    'Free plan: you reached the limit of {{n}} imports this month. Upgrade to Premium to import more.',
  'Plan gratis: llegaste al límite de {{n}} movimientos escaneados este mes. Actualiza a Premium para escanear más.':
    'Free plan: you reached the limit of {{n}} scanned transactions this month. Upgrade to Premium to scan more.',
  'Plan gratis: llegaste al límite de {{n}} conciliaciones este mes. Actualiza a Premium para conciliar más.':
    'Free plan: you reached the limit of {{n}} reconciliations this month. Upgrade to Premium to reconcile more.',
  'Ese movimiento ya no está pendiente o es de otro periodo. Aquí tienes los pendientes que quedan.':
    'That transaction is no longer pending or is from another period. Here are the remaining pending ones.',
  // Eliminar cuenta
  'Eliminar mi cuenta': 'Delete my account',
  'Borra tu cuenta y todos tus datos de forma permanente.': 'Permanently delete your account and all your data.',
  'Se borrarán para siempre tus movimientos, cuentas, tarjetas, presupuestos, reglas y conexiones de correo o calendario. Si tienes Premium, la suscripción se cancela. Esto no se puede deshacer.':
    'Your transactions, accounts, cards, budgets, rules and email or calendar connections will be deleted forever. If you have Premium, the subscription is canceled. This cannot be undone.',
  'Si quieres conservar tus movimientos, expórtalos a Excel antes (Reportes).':
    'If you want to keep your transactions, export them to Excel first (Reports).',
  'Escribe ELIMINAR para confirmar': 'Type ELIMINAR to confirm',
  'Eliminar definitivamente': 'Delete permanently',
  'Eliminar tu cuenta': 'Delete your account',
  'Puedes borrar tu cuenta de Mi Control de Finanzas Personales y todos tus datos cuando quieras. El borrado es inmediato y no se puede deshacer.':
    'You can delete your Mi Control de Finanzas Personales account and all your data whenever you want. Deletion is immediate and cannot be undone.',
  'Qué se borra': 'What gets deleted',
  'Tu perfil y tu inicio de sesión.': 'Your profile and your login.',
  'Movimientos, cuentas, tarjetas, líneas de crédito, presupuestos, suscripciones y categorías.':
    'Transactions, accounts, cards, credit lines, budgets, subscriptions and categories.',
  'Reglas y conexiones de correo (Gmail/Outlook), Google Calendar y captura en el teléfono. Se revoca el acceso a Google.':
    'Email rules and connections (Gmail/Outlook), Google Calendar and phone capture. Google access is revoked.',
  'Tu suscripción Premium, que se cancela en ese momento.': 'Your Premium subscription, which is canceled right away.',
  'No conservamos copias de tus datos financieros después del borrado. El procesador de pagos (Stripe o Google Play) puede conservar el registro de cobros que exige la ley.':
    'We keep no copies of your financial data after deletion. The payment processor (Stripe or Google Play) may keep the charge records required by law.',
  'Sesión iniciada como {{email}}.': 'Signed in as {{email}}.',
  'Cómo hacerlo': 'How to do it',
  'Inicia sesión (en la app o aquí mismo).': 'Sign in (in the app or right here).',
  'Ve a Configuración → Eliminar mi cuenta.': 'Go to Settings → Delete my account.',
  'Escribe ELIMINAR y confirma.': 'Type ELIMINAR and confirm.',
  '¿No puedes entrar? Escríbenos desde el correo de tu cuenta a {{email}} y la borramos por ti.':
    "Can't sign in? Email us from your account's address at {{email}} and we'll delete it for you.",
  // Aviso previo al acceso a notificaciones
  'Antes de dar acceso a notificaciones': 'Before granting notification access',
  'Para registrar tus cargos automáticamente, esta app necesita leer las notificaciones que llegan a tu teléfono.':
    'To record your charges automatically, this app needs to read the notifications that arrive on your phone.',
  'Solo lee las notificaciones de las apps que tú marques (tu banco, wallet o tiendas).':
    'It only reads notifications from the apps you select (your bank, wallet or stores).',
  'Solo envía a nuestro servidor las que traen un monto, para sacar monto, fecha, comercio y terminación de tarjeta.':
    'It only sends the ones with an amount to our server, to extract amount, date, merchant and card ending.',
  'No guarda el texto de la notificación ni lee las de otras apps. No se usa para publicidad ni se comparte.':
    "It doesn't store the notification text or read other apps' notifications. It's not used for ads or shared.",
  'Funciona aun con la app cerrada. Puedes quitar el acceso cuando quieras desde Ajustes de Android.':
    'It works even with the app closed. You can remove access anytime from Android Settings.',
  'No, gracias': 'No, thanks',
  'Acepto, continuar': 'I agree, continue',
  // Traducciones completadas antes de la verificación de Google (2026-09-26)
  'Crédito usado':
    'Credit used',
  'Notificaciones':
    'Notifications',
  'Hoy':
    'Today',
  'Esta semana':
    'This week',
  'Este mes':
    'This month',
  'Personalizado':
    'Custom',
  'Apartado dentro de {{name}}. Comparte su moneda y tiene su propio saldo y rendimiento.':
    'Pocket inside {{name}}. It shares its currency and has its own balance and yield.',
  'CLABE (opcional)':
    'CLABE (optional)',
  'Últimos 4 de la CLABE (opcional)':
    'Last 4 digits of the CLABE (optional)',
  'Número de cuenta (opcional)':
    'Account number (optional)',
  'Últimos 4 de la cuenta (opcional)':
    'Last 4 digits of the account (optional)',
  'Sirven para identificar automáticamente depósitos y transferencias por SMS o correo. Solo los últimos 4 dígitos se usan para eso, aunque guardes el número completo. La CLABE y el número de cuenta no comparten terminación, por eso van por separado.':
    'They are used to automatically identify deposits and transfers from SMS or email. Only the last 4 digits are used for that, even if you store the full number. The CLABE and the account number don\'t share the same ending, which is why they are separate.',
  'Vales de despensa':
    'Meal vouchers',
  'Tramos por monto (opcional)':
    'Tiers by amount (optional)',
  'Agregar tramo':
    'Add tier',
  'Son tramos MARGINALES: se ordenan solos por "Desde", sin importar en qué orden los captures. El primero (normalmente "Desde $0") cubre hasta el siguiente tramo, y así sucesivamente. Sustituyen a la tasa de arriba mientras haya al menos uno.':
    'These are MARGINAL tiers: they sort themselves by "From", regardless of the order you enter them. The first one (usually "From $0") covers up to the next tier, and so on. They replace the rate above as long as there is at least one.',
  'Desde ($)':
    'From ($)',
  'Tasa (%)':
    'Rate (%)',
  'Así quedaría:':
    'It would look like this:',
  'De {{from}} a {{to}}: {{rate}}%':
    'From {{from}} to {{to}}: {{rate}}%',
  'De {{from}} en adelante: {{rate}}%':
    'From {{from}} and up: {{rate}}%',
  'dos tramos empiezan en el mismo monto':
    'two tiers start at the same amount',
  'Crear apartado':
    'Create pocket',
  '+ Apartado':
    '+ Pocket',
  'Mover a apartado':
    'Move to pocket',
  'Convertir "{{name}}" en apartado de…':
    'Turn "{{name}}" into a pocket of…',
  'Sus transacciones no se tocan: solo pasa a mostrarse anidada bajo la cuenta que elijas.':
    'Its transactions are untouched: it is only shown nested under the account you choose.',
  'Elige una cuenta…':
    'Choose an account…',
  'Confirmar':
    'Confirm',
  'Ojo: quedará en {{cur1}} dentro de una cuenta en {{cur2}}.':
    'Heads up: it will be in {{cur1}} inside an account in {{cur2}}.',
  'Apartado':
    'Pocket',
  'El logo debe ser una imagen.':
    'The logo must be an image.',
  'La imagen no debe superar 2 MB.':
    'The image must not exceed 2 MB.',
  'Error al subir el logo.':
    'Error uploading the logo.',
  'Marca de la app':
    'App branding',
  'Personaliza el nombre y el logo que se ven en la barra lateral y la pestaña del navegador.':
    'Customize the name and logo shown in the sidebar and the browser tab.',
  'Subiendo…':
    'Uploading…',
  'Cambiar logo':
    'Change logo',
  'Nombre de la app':
    'App name',
  'Guardar nombre':
    'Save name',
  'Escribe tu nombre y apellido.':
    'Enter your first and last name.',
  'La contraseña debe tener al menos 6 caracteres.':
    'The password must be at least 6 characters long.',
  'Este correo ya tiene una cuenta. Inicia sesión o usa "¿Olvidaste tu contraseña?".':
    'This email already has an account. Sign in or use "Forgot your password?".',
  'Te enviamos un correo a {{email}} para confirmar que es tuyo. Abre el enlace para activar tu cuenta.':
    'We sent an email to {{email}} to confirm it\'s yours. Open the link to activate your account.',
  'Escribe tu correo y contraseña.':
    'Enter your email and password.',
  'Correo o contraseña incorrectos.':
    'Incorrect email or password.',
  'Te enviamos un enlace a {{email}} para restablecer tu contraseña.':
    'We sent a link to {{email}} to reset your password.',
  'Contraseña':
    'Password',
  'Código':
    'Code',
  'Apellido':
    'Last name',
  'Entrando…':
    'Signing in…',
  '¿Olvidaste tu contraseña?':
    'Forgot your password?',
  'Creando cuenta…':
    'Creating account…',
  'Ya tengo cuenta, iniciar sesión':
    'I already have an account, sign in',
  'Enviar enlace de recuperación':
    'Send recovery link',
  '← Volver a iniciar sesión':
    '← Back to sign in',
  'Las contraseñas no coinciden.':
    'The passwords don\'t match.',
  'Nueva contraseña':
    'New password',
  '¡Listo! Tu contraseña se actualizó. Entrando…':
    'Done! Your password was updated. Signing you in…',
  'Abre esta página desde el enlace que te enviamos por correo.':
    'Open this page from the link we emailed you.',
  'Confirmar contraseña':
    'Confirm password',
  'Guardar contraseña':
    'Save password',
  '← Ir a iniciar sesión':
    '← Go to sign in',
  'Ej: Nu, BBVA':
    'e.g. Nu, BBVA',
  '🍎 Vales de despensa':
    '🍎 Meal vouchers',
  'Cuenta de vales':
    'Voucher account',
  'Vales':
    'Vouchers',
  'Física':
    'Physical',
  'Tus tarjetas de crédito, débito y vales. Los límites y pagos están en Líneas de crédito.':
    'Your credit, debit and voucher cards. Limits and payments are under Credit lines.',
  'Agrupar por':
    'Group by',
  'Formato (física/virtual)':
    'Format (physical/virtual)',
  'Ver línea':
    'View line',
  'Guardar':
    'Save',
  'editar':
    'edit',
  'Saldo confirmado:':
    'Confirmed balance:',
  '¿Coincide con tu estado de cuenta?':
    'Does it match your statement?',
  'confirmar saldo':
    'confirm balance',
  'A pagar de este periodo':
    'Due this period',
  'Consumos del {{start}} al {{end}}':
    'Purchases from {{start}} to {{end}}',
  'ya abonado':
    'already paid',
  'Pagar':
    'Pay',
  'Meses sin intereses activos':
    'Active interest-free installments',
  '{{paid}}/{{total}} pagadas · faltan':
    '{{paid}}/{{total}} paid · remaining',
  'sigue {{month}}':
    'next: {{month}}',
  'Ej: Nu México':
    'e.g. Nu Mexico',
  'Crear línea':
    'Create line',
  '¿Eliminar la línea "{{name}}"? Sus {{n}} tarjetas quedarán sin línea asignada.':
    'Delete the line "{{name}}"? Its {{n}} cards will be left without an assigned line.',
  '¿Eliminar la línea "{{name}}"?':
    'Delete the line "{{name}}"?',
  'Límites, fechas de corte y pago que comparten tus tarjetas de crédito.':
    'Limits, statement and due dates shared by your credit cards.',
  '+ Agregar línea':
    '+ Add line',
  'Sin líneas de crédito. Crea una para asignarle tus tarjetas.':
    'No credit lines. Create one to assign your cards to it.',
  'Sin tarjetas asignadas':
    'No cards assigned',
  'Tarjetas:':
    'Cards:',
  'Pagar {{name}}':
    'Pay {{name}}',
  'Captura automática de correo activada. Los correos nuevos se registrarán solos.':
    'Automatic email capture enabled. New emails will be recorded automatically.',
  'Activada, pero Google no entregó el permiso offline. Desconecta y vuelve a conectar Gmail para que la captura se mantenga.':
    'Enabled, but Google did not grant offline access. Disconnect and reconnect Gmail to keep the capture running.',
  'Captura automática de correo desactivada.':
    'Automatic email capture disabled.',
  'Activada, pero Microsoft no entregó el permiso offline. Desconecta y vuelve a conectar Outlook para que la captura se mantenga.':
    'Enabled, but Microsoft did not grant offline access. Disconnect and reconnect Outlook to keep the capture running.',
  '¿Borrar el remitente "{{name}}"?':
    'Delete the sender "{{name}}"?',
  'Captura automática activa: los correos nuevos de tu banco se registran solos, en tiempo real, como pendientes.':
    'Automatic capture is on: new emails from your bank are recorded on their own, in real time, as pending.',
  'Lee alertas de tu banco y correos de proveedores (facturas, tickets, domiciliados) desde Gmail u Outlook y crea movimientos pendientes.':
    'Reads alerts from your bank and emails from vendors (invoices, receipts, direct debits) from Gmail or Outlook and creates pending transactions.',
  'Editando: {{name}}':
    'Editing: {{name}}',
  '1. Remitentes (banco o proveedor)':
    '1. Senders (bank or vendor)',
  'Indica de qué correos llegan las alertas o tickets (ej.':
    'Indicate which emails the alerts or receipts come from (e.g.',
  'Solo se leen esos correos. Las facturas CFDI (XML) se leen automáticamente sin configurar regex.':
    'Only those emails are read. CFDI invoices (XML) are read automatically without configuring a regex.',
  'ingreso':
    'income',
  'Borrar':
    'Delete',
  'Banco o proveedor':
    'Bank or vendor',
  '▲ Ocultar opciones avanzadas':
    '▲ Hide advanced options',
  '▼ Opciones avanzadas (moneda, tipo, concepto, tarjeta)':
    '▼ Advanced options (currency, type, description, card)',
  'Tipo de movimiento':
    'Transaction type',
  'Moneda (opcional, ej. MXN, USD)':
    'Currency (optional, e.g. MXN, USD)',
  'Regex de concepto (opcional)':
    'Description regex (optional)',
  'Regex de terminación de tarjeta (opcional)':
    'Card ending regex (optional)',
  'Si el correo trae la terminación de la tarjeta, se asignará automáticamente la tarjeta que coincida (y su cuenta ligada).':
    'If the email includes the card\'s last digits, the matching card (and its linked account) is assigned automatically.',
  'Cuenta por defecto (opcional)':
    'Default account (optional)',
  'Sin cuenta por defecto':
    'No default account',
  'Se usa solo cuando el correo no trae ninguna terminación de tarjeta/cuenta (ej. pagos vía wallet de un gateway como EBANX/Xsolla).':
    'Used only when the email has no card/account ending (e.g. wallet payments through a gateway such as EBANX/Xsolla).',
  'Sin categoría fija':
    'No fixed category',
  'Se asigna siempre a los movimientos de este remitente (ej. PlayStation Store → Videojuegos), sin importar qué se haya comprado.':
    'Always assigned to transactions from this sender (e.g. PlayStation Store → Video games), regardless of what was purchased.',
  'Reconectar (forzar permisos)':
    'Reconnect (force permissions)',
  'Si iniciaste sesión con Google normalmente (no con este botón), el token guardado no trae permiso de Gmail. Pulsa "Reconectar" para autorizarlo, incluso si ya dice conectado.':
    'If you signed in with Google normally (not with this button), the saved token has no Gmail permission. Press "Reconnect" to authorize it, even if it already says connected.',
  '¿Error 403 / "Acceso bloqueado" al conectar? Tu correo debe estar añadido como usuario de prueba en la pantalla de consentimiento de OAuth en Google Cloud.':
    'Getting a 403 error / "Access blocked" when connecting? Your email must be added as a test user on the OAuth consent screen in Google Cloud.',
  '3. Captura automática en tiempo real (Gmail)':
    '3. Automatic real-time capture (Gmail)',
  '✅ Activada. Google avisa a la app en cuanto llega un correo y se registra solo.':
    '✅ Enabled. Google notifies the app as soon as an email arrives and it is recorded automatically.',
  'Actívala para no tener que pulsar "Sincronizar": los correos nuevos se registran solos en cuanto llegan.':
    'Turn it on so you don\'t have to press "Sync": new emails are recorded automatically as soon as they arrive.',
  'Se renueva automáticamente cada semana.':
    'Renews automatically every week.',
  'Activando…':
    'Enabling…',
  'Activar tiempo real':
    'Enable real time',
  'Desactivar tiempo real':
    'Disable real time',
  'Requiere conectar Gmail arriba. En modo de prueba de Google, cada cuenta debe reconectar Gmail cada 7 días.':
    'Requires connecting Gmail above. In Google\'s testing mode, each account must reconnect Gmail every 7 days.',
  '4. Conecta Outlook y sincroniza':
    '4. Connect Outlook and sync',
  'Conectar Outlook':
    'Connect Outlook',
  'Outlook conectado':
    'Outlook connected',
  'Usa los mismos remitentes configurados arriba: no hace falta duplicarlos por proveedor.':
    'Uses the same senders configured above: no need to duplicate them per provider.',
  '5. Captura automática en tiempo real (Outlook)':
    '5. Automatic real-time capture (Outlook)',
  '✅ Activada. Microsoft avisa a la app en cuanto llega un correo y se registra solo.':
    '✅ Enabled. Microsoft notifies the app as soon as an email arrives and it is recorded automatically.',
  'Se renueva automáticamente antes de vencer.':
    'Renews automatically before it expires.',
  'Requiere conectar Outlook arriba.':
    'Requires connecting Outlook above.',
  'Invitación enviada por correo.':
    'Invitation sent by email.',
  'Invitación creada, pero no se pudo enviar el correo. La persona la verá igual al entrar a Mi Control de Finanzas Personales.':
    'Invitation created, but the email could not be sent. The person will still see it when they sign in to Mi Control de Finanzas Personales.',
  'Un momento…':
    'One moment…',
  'Desactivar captura':
    'Disable capture',
  'Activar captura automática':
    'Enable automatic capture',
  'tu tarjeta':
    'your card',
  'Avisos pendientes de presupuestos, suscripciones y pagos de tarjeta.':
    'Pending alerts for budgets, subscriptions and card payments.',
  'No tienes notificaciones pendientes.':
    'You have no pending notifications.',
  'Pagos de tarjeta':
    'Card payments',
  'Mensualidad de {{name}}{{amount}} vence el {{date}}.':
    'The installment for {{name}}{{amount}} is due on {{date}}.',
  'El pago de {{name}}{{amount}} vence el {{date}}.':
    'The payment for {{name}}{{amount}} is due on {{date}}.',
  'tu suscripción':
    'your subscription',
  '{{name}} subió de {{old}} a {{new}}.':
    '{{name}} went up from {{old}} to {{new}}.',
  '{{name}} te cobrará {{amount}} el {{date}}.':
    '{{name}} will charge you {{amount}} on {{date}}.',
  'No se detectaron movimientos en el documento. Intenta con otro archivo.':
    'No transactions were detected in the document. Try another file.',
  'No se pudo leer el documento con IA: {{error}}.':
    'Could not read the document with AI: {{error}}.',
  'El PDF tiene más de 8 páginas; solo se analizaron las primeras 8.':
    'The PDF has more than 8 pages; only the first 8 were analyzed.',
  'No se pudo leer el PDF con IA: {{error}}. Intenta con otro archivo o con una foto.':
    'Could not read the PDF with AI: {{error}}. Try another file or a photo.',
  'No se pudo leer el ticket: {{error}}.':
    'Could not read the receipt: {{error}}.',
  'La suma del detalle ({{sum}}) no cuadra con el total ({{total}}).':
    'The sum of the details ({{sum}}) doesn\'t match the total ({{total}}).',
  'Selecciona al menos un movimiento':
    'Select at least one transaction',
  'Cada movimiento marcado necesita una cuenta o tarjeta':
    'Each selected transaction needs an account or card',
  'Falta el tipo de cambio de {{currency}} → {{main}}. Complétalo arriba antes de guardar.':
    'The {{currency}} → {{main}} exchange rate is missing. Fill it in above before saving.',
  'Toma una foto del ticket o sube un estado de cuenta y registra los movimientos automáticamente':
    'Take a photo of the receipt or upload a statement and record the transactions automatically',
  '¿Quieres intentar con el OCR local (más lento y menos preciso)?':
    'Do you want to try local OCR (slower and less accurate)?',
  'Intentar':
    'Try',
  'Recibo':
    'Receipt',
  'Estado de cuenta':
    'Statement',
  'Sube el PDF de tu estado de cuenta (banco o tarjeta). Vamos a leer los movimientos y podrás revisarlos antes de guardar.':
    'Upload the PDF of your statement (bank or card). We\'ll read the transactions and you can review them before saving.',
  'o subir un PDF':
    'or upload a PDF',
  'Analizando el documento con IA…':
    'Analyzing the document with AI…',
  'Se toma el tipo de cambio de la fecha del movimiento. Puedes ajustarlo si lo necesitas.':
    'The exchange rate for the transaction date is used. You can adjust it if needed.',
  'Revisa los movimientos detectados ({{count}})':
    'Review the detected transactions ({{count}})',
  'Los marcados 💳 (pago a tarjeta) y 🔁 (compra a meses) se detectaron pero se dejaron sin seleccionar: regístralos desde "Nueva transacción" para que se contabilicen correctamente (línea de crédito, plazo, etc.).':
    'Those marked 💳 (card payment) and 🔁 (installment purchase) were detected but left unselected: record them from "New transaction" so they are counted correctly (credit line, term, etc.).',
  'Cuenta para todos los movimientos':
    'Account for all transactions',
  'O tarjeta para todos los movimientos':
    'Or card for all transactions',
  'Tipo de cambio hacia {{main}} (se autocompleta, puedes corregirlo)':
    'Exchange rate to {{main}} (auto-filled, you can correct it)',
  'Cuenta / tarjeta':
    'Account / card',
  'Pago a tarjeta detectado':
    'Card payment detected',
  'Compra a meses (MSI) detectada':
    'Installment purchase (MSI) detected',
  'Selecciona cuenta o tarjeta':
    'Select account or card',
  'Guardar seleccionadas ({{count}})':
    'Save selected ({{count}})',
  'Cada movimiento usa la moneda que detectó la IA; corrígela por fila si hace falta.':
    'Each transaction uses the currency the AI detected; correct it per row if needed.',
  'Se guardaron {{saved}} movimientos.':
    '{{saved}} transactions were saved.',
  '{{n}} ya estaban registrados (duplicados).':
    '{{n}} were already recorded (duplicates).',
  '{{n}} no se pudieron guardar.':
    '{{n}} could not be saved.',
  'Premium: elige el periodo del resumen (hoy, semana, mes o personalizado). Actualiza tu plan para más análisis.':
    'Premium: choose the summary period (today, week, month or custom). Upgrade your plan for more analysis.',
  'Balance efectivo':
    'Cash balance',
  'Sin transacciones en este periodo.':
    'No transactions in this period.',
  'Gasto por Suscripción':
    'Spending by Subscription',
  'Efectivo que salió (incluye pagos de tarjeta)':
    'Cash that went out (includes card payments)',
  'Deuda generada con tarjeta en el periodo':
    'Debt generated with cards in the period',
  'Ingresos − egresos de efectivo. El consumo a crédito no cuenta hasta que lo pagas.':
    'Income − cash expenses. Credit spending doesn\'t count until you pay it.',
  'Balance económico':
    'Economic balance',
  'Reconoce el gasto al consumir con tarjeta (resta el crédito usado).':
    'Recognizes the expense when you spend with a card (subtracts the credit used).',
  '¿Desconectar Google Calendar? Los recordatorios ya creados se quedan en tu calendario.':
    'Disconnect Google Calendar? Reminders already created will stay in your calendar.',
  'Reporte financiero por correo':
    'Financial report by email',
  'Un resumen de ingresos, egresos y categorías, con un Excel adjunto, con la frecuencia que elijas.':
    'A summary of income, expenses and categories, with an Excel attachment, at the frequency you choose.',
  'Día del mes':
    'Day of the month',
  'Cada':
    'Every',
  'Crea un evento en tu calendario cuando se acerca el próximo cobro de una suscripción o la fecha de pago de una tarjeta/MSI.':
    'Creates an event in your calendar when the next subscription charge or a card/MSI payment date is coming up.',
  'Conectar Google Calendar':
    'Connect Google Calendar',
  'Activar recordatorios':
    'Enable reminders',
  'Conectado{{email}}':
    'Connected{{email}}',
  'Desconectar':
    'Disconnect',
  'Próximo cobro de suscripciones':
    'Upcoming subscription charge',
  'Pago de tarjeta / MSI':
    'Card payment / MSI',
  'Captura automática desactivada.':
    'Automatic capture disabled.',
  'Agrega al menos un remitente de tu banco antes de activar.':
    'Add at least one bank sender before enabling.',
  'Captura automática activada. Los SMS de tus bancos se registrarán solos como pendientes.':
    'Automatic capture enabled. SMS messages from your banks will be recorded on their own as pending.',
  'Captura automática de SMS':
    'Automatic SMS capture',
  'Registra solo las alertas de compra y transferencia por SMS de tu banco. Disponible solo en la app de Android.':
    'Records only purchase and transfer alerts sent by SMS from your bank. Available only in the Android app.',
  'Palabras de ingreso (coma, opcional)':
    'Income words (comma-separated, optional)',
  'Palabras de gasto (coma, opcional)':
    'Expense words (comma-separated, optional)',
  'Si el SMS contiene una palabra de ingreso se registra como ingreso (ej. transferencias recibidas); si no, como gasto. Si lo dejas vacío se usan listas por defecto en español.':
    'If the SMS contains an income word it is recorded as income (e.g. received transfers); otherwise as an expense. If left empty, default Spanish lists are used.',
  '2. Captura automática':
    '2. Automatic capture',
  '✅ Activada. Los SMS de tus bancos se registran solos como pendientes en cuanto llegan.':
    '✅ Enabled. SMS messages from your banks are recorded on their own as pending as soon as they arrive.',
  'Actívala para que los SMS se registren solos, sin abrir la app. Se pedirá permiso para leer y recibir SMS.':
    'Turn it on so SMS messages are recorded automatically, without opening the app. Permission to read and receive SMS will be requested.',
  'Los movimientos se crean como pendientes; confírmalos en Transacciones para que cuenten en tus saldos. Para que funcione con la app cerrada, excluye la app de la optimización de batería.':
    'Transactions are created as pending; confirm them in Transactions so they count toward your balances. For it to work with the app closed, exclude the app from battery optimization.',
  'Otro (escribir nombre)':
    'Other (type a name)',
  'Sin tarjeta / cuenta asignada':
    'No card / account assigned',
  'Comercio':
    'Merchant',
  'Ciclo de cobro':
    'Billing cycle',
  'Próximo cobro':
    'Next charge',
  'Generar el cargo automáticamente':
    'Generate the charge automatically',
  'Úsalo si este comercio NO te manda un correo o SMS que la app pueda leer: se registrará solo cada ciclo, cargado a la tarjeta/cuenta de arriba.':
    'Use it if this merchant does NOT send an email or SMS the app can read: it will be recorded on its own each cycle, charged to the card/account above.',
  'Agregar suscripción':
    'Add subscription',
  'Sin tarjeta / cuenta':
    'No card / account',
  '¿"{{name}}" no es una suscripción? No se volverá a sugerir.':
    'Is "{{name}}" not a subscription? It won\'t be suggested again.',
  '¿Cancelar "{{name}}"? Si vuelve a cobrar, se sugerirá de nuevo.':
    'Cancel "{{name}}"? If it charges again, it will be suggested again.',
  '¿Eliminar "{{name}}" definitivamente?':
    'Permanently delete "{{name}}"?',
  'No había ningún cobro pendiente por registrar.':
    'There were no pending charges to record.',
  'Cobro de {{amount}} registrado ({{date}}).':
    'Charge of {{amount}} recorded ({{date}}).',
  'Se registraron {{n}} cobros pendientes.':
    '{{n}} pending charges were recorded.',
  'No se pudo registrar el cobro.':
    'The charge could not be recorded.',
  'Cargos recurrentes domiciliados a tus tarjetas y cuentas.':
    'Recurring charges billed to your cards and accounts.',
  '+ Agregar manualmente':
    '+ Add manually',
  'Gasto mensual equivalente':
    'Equivalent monthly spending',
  'Gasto anual equivalente':
    'Equivalent yearly spending',
  'Sugeridas':
    'Suggested',
  'No es suscripción':
    'Not a subscription',
  'Buscando…':
    'Searching…',
  'Buscar más suscripciones':
    'Find more subscriptions',
  'Sin suscripciones todavía. Se detectan solas cuando llega un cargo de Netflix, Spotify, etc. por SMS o correo, o agrégalas manualmente.':
    'No subscriptions yet. They are detected automatically when a Netflix, Spotify, etc. charge arrives by SMS or email, or add them manually.',
  'Se registra sola cada ciclo, sin esperar correo/SMS':
    'Recorded automatically each cycle, without waiting for an email/SMS',
  'Automático':
    'Automatic',
  'próximo cobro':
    'next charge',
  'El próximo cobro ya venció y todavía no se ha contabilizado':
    'The next charge is overdue and has not been recorded yet',
  'Registrar cobro':
    'Record charge',
  'Pausar':
    'Pause',
  'Ver historial ({{n}})':
    'View history ({{n}})',
  'Reactivar':
    'Reactivate',
  'Escribe un monto válido.':
    'Enter a valid amount.',
  'Reembolso: {{concept}}':
    'Refund: {{concept}}',
  'Reembolso':
    'Refund',
  'Reembolsar compra':
    'Refund purchase',
  'Reembolso registrado. Este plan de MSI se canceló: ya no se te cobrarán las mensualidades restantes.':
    'Refund recorded. This installment plan was cancelled: you will no longer be charged the remaining installments.',
  'Ya reembolsado':
    'Already refunded',
  'de':
    'of',
  'Esta compra ya se reembolsó por completo.':
    'This purchase has already been fully refunded.',
  'Monto a reembolsar':
    'Amount to refund',
  'Ej: Cancelación del pedido, artículo devuelto…':
    'e.g. Order cancelled, item returned…',
  'Reembolsar':
    'Refund',
  'Pago de tarjeta':
    'Card payment',
  'Selecciona la cuenta origen':
    'Select the source account',
  'Selecciona la cuenta origen y la línea de crédito a pagar':
    'Select the source account and the credit line to pay',
  'Selecciona la compra a reembolsar':
    'Select the purchase to refund',
  'Selecciona la cuenta de la que retiras el efectivo':
    'Select the account you withdraw the cash from',
  'Selecciona la cuenta de efectivo a la que va el retiro':
    'Select the cash account the withdrawal goes to',
  '💳 Pago de tarjeta':
    '💳 Card payment',
  '🏧 Retiro de efectivo':
    '🏧 Cash withdrawal',
  '↩️ Reembolso':
    '↩️ Refund',
  'La cuenta destino no es mía (cuenta externa)':
    'The destination account isn\'t mine (external account)',
  'Sale dinero de verdad: se contará como egreso en tus reportes.':
    'Money really leaves: it will count as an expense in your reports.',
  'Retiras de':
    'Withdraw from',
  'Selecciona la cuenta':
    'Select the account',
  'Ya lo gastaste o es para un pago':
    'Already spent or meant for a payment',
  'Actívalo si el efectivo ya se usó: contará como egreso ahora. Déjalo apagado si solo lo tienes en la cartera.':
    'Turn it on if the cash has already been used: it will count as an expense now. Leave it off if you\'re just holding it in your wallet.',
  'Se registrará como egreso desde la cuenta de la que retiras.':
    'It will be recorded as an expense from the account you withdraw from.',
  'Efectivo va a (cartera)':
    'Cash goes to (wallet)',
  'Selecciona la cuenta de efectivo':
    'Select the cash account',
  'No tienes una cuenta de tipo Efectivo. Crea una en Cuentas para guardar el efectivo de la cartera.':
    'You don\'t have a Cash account. Create one in Accounts to hold your wallet cash.',
  'Solo pasa a tu cartera: aún no es egreso. Lo será cuando registres el gasto de ese efectivo.':
    'It only moves to your wallet: it isn\'t an expense yet. It will be once you record spending that cash.',
  'Línea de crédito a pagar':
    'Credit line to pay',
  'Selecciona la línea':
    'Select the line',
  'Meses sin intereses de esta línea':
    'Interest-free installments on this line',
  'Marca las mensualidades que cubre este pago.':
    'Mark the installments this payment covers.',
  'mensualidad de {{month}}; van {{paid}}/{{total}})':
    '{{month}} installment; {{paid}}/{{total}} paid)',
  'Compra a reembolsar':
    'Purchase to refund',
  'Selecciona una compra':
    'Select a purchase',
  'Monto de la compra':
    'Purchase amount',
  'Se marcarán {{n}} mensualidades ({{amount}}) como ya pagadas.':
    '{{n}} installments ({{amount}}) will be marked as paid.',
  'Detalle (opcional)':
    'Details (optional)',
  'Agregar línea':
    'Add line',
  'Quitar línea':
    'Remove line',
  'La suma cuadra con el total.':
    'The sum matches the total.',
  'Restan {{amount}} por asignar':
    '{{amount}} left to assign',
  'Te pasaste por {{amount}}':
    'You went over by {{amount}}',
  'cuenta externa':
    'external account',
  'Vista de tarjetas':
    'Card view',
  'Vista de tabla':
    'Table view',
  'Tabla':
    'Table',
  '{{n}} líneas':
    '{{n}} lines',
  'Reembolsado':
    'Refunded',
  'Ver detalle ({{n}} líneas)':
    'View details ({{n}} lines)',
  'Detalle':
    'Details',
  'Confirma el rendimiento calculado':
    'Confirm the calculated yield',
  'Ya viene precargado con el cálculo del sistema. Ajústalo solo si tu banco dio un monto distinto — al confirmar se registra como una transacción de ingreso.':
    'It comes pre-filled with the system\'s calculation. Adjust it only if your bank gave a different amount — confirming records it as an income transaction.',
  'Monto a contabilizar ($)':
    'Amount to record ($)',
  'Verificar y contabilizar':
    'Verify and record',
  '(apartado de {{name}})':
    '(pocket of {{name}})',
  // Traducciones completadas antes de la verificación de Google (2026-09-26)
  'Tu panorama general: saldo total, gastos e ingresos del mes y gráficas rápidas de tus finanzas.':
    'Your big picture: total balance, this month\'s expenses and income, and quick charts of your finances.',
  'Registra tus cuentas de efectivo, débito o ahorro. Cada transacción que agregues se descuenta o suma aquí. Dentro de una cuenta puedes separar dinero en apartados (cajitas) con "Mover a apartado".':
    'Register your cash, debit or savings accounts. Every transaction you add is subtracted from or added to them here. Inside an account you can set money aside in pockets with "Move to pocket".',
  'Tus tarjetas de crédito o débito. Las de crédito se agrupan en una línea de crédito (siguiente sección) para calcular su estado de cuenta.':
    'Your credit or debit cards. Credit cards are grouped into a credit line (next section) to calculate their statement.',
  'Fechas de corte y pago, cuánto llevas gastado del periodo y cuánto debes pagar. Cada cargo nuevo actualiza el monto a pagar automáticamente.':
    'Statement and due dates, how much you\'ve spent this period and how much you owe. Every new charge updates the amount due automatically.',
  'Todos tus movimientos: gastos, ingresos, pagos de tarjeta y transferencias. Aquí puedes editarlos o corregir su categoría.':
    'All your transactions: expenses, income, card payments and transfers. Here you can edit them or fix their category.',
  'Define un límite mensual por categoría y recibe un aviso cuando estés por pasarte.':
    'Set a monthly limit per category and get an alert when you\'re about to go over.',
  'Detecta Netflix, Spotify y demás cargos recurrentes por SMS/correo, o agrégalos a mano. Si un comercio no manda correo/SMS, activa "Generar el cargo automáticamente" para que se registre solo cada ciclo.':
    'Detects Netflix, Spotify and other recurring charges from SMS/email, or add them by hand. If a merchant doesn\'t send an email/SMS, turn on "Generate the charge automatically" so it is recorded on its own each cycle.',
  'Sube un archivo (Excel/CSV) con movimientos ya existentes para no capturarlos uno por uno.':
    'Upload a file (Excel/CSV) with existing transactions so you don\'t have to enter them one by one.',
  'Toma una foto de un ticket o sube un PDF/XML y la app detecta los datos del gasto por ti.':
    'Take a photo of a receipt or upload a PDF/XML and the app detects the expense data for you.',
  'Sube el estado de cuenta de una tarjeta o cuenta y compáralo, movimiento por movimiento, con lo que registraste: te dice qué falta, qué sobra y qué tiene un monto distinto.':
    'Upload the statement of a card or account and compare it, transaction by transaction, with what you\'ve recorded: it tells you what\'s missing, what\'s extra and what has a different amount.',
  'Invita a otras personas a compartir cuentas o líneas de crédito y ver las finanzas familiares juntos.':
    'Invite other people to share accounts or credit lines and see the family finances together.',
  'Conecta tu Gmail para detectar cargos y pagos automáticamente desde los correos de tu banco.':
    'Connect your Gmail to detect charges and payments automatically from your bank emails.',
  'En Android, captura tus movimientos en tiempo real desde los SMS que te manda tu banco.':
    'On Android, capture your transactions in real time from the SMS your bank sends you.',
  'En Android, registra solos los cargos que te avisan las apps de tu banco, wallet o tiendas. Si el mismo cargo llega también por SMS o correo, se cuenta una sola vez.':
    'On Android, automatically record the charges notified by your bank, wallet or store apps. If the same charge also arrives by SMS or email, it is counted only once.',
  'Organiza tus gastos e ingresos en categorías propias, con color e ícono, para que tus reportes tengan sentido.':
    'Organize your expenses and income into your own categories, with color and icon, so your reports make sense.',
  'Da seguimiento a cuentas de inversión o ahorro con rendimiento (incluso por tramos de monto, y apartados con su propia tasa). Al verificar, se contabiliza como una transacción real.':
    'Track investment or savings accounts with yield (including tiers by amount, and pockets with their own rate). When you verify, it is recorded as a real transaction.',
  'Gráficas a fondo de tus finanzas por periodo: ingresos vs. gastos, gasto por categoría y más, exportables a Excel.':
    'In-depth charts of your finances by period: income vs. expenses, spending by category and more, exportable to Excel.',
  '¿Algo no funciona o tienes una duda? Aquí hay respuestas rápidas y guías paso a paso, empezando por la captura por notificaciones (qué activar en tu teléfono para que funcione).':
    'Something not working or have a question? Here are quick answers and step-by-step guides, starting with notification capture (what to enable on your phone for it to work).',
  'Tema, moneda principal, privacidad (ocultar montos), tu suscripción Premium y demás preferencias de tu cuenta. Aquí también puedes eliminar tu cuenta y tus datos.':
    'Theme, main currency, privacy (hide amounts), your Premium subscription and other account preferences. You can also delete your account and data here.',
  'Panel exclusivo de administración: límites del plan gratis, apariencia de la app y configuración global.':
    'Admin-only panel: free plan limits, app appearance and global settings.',
  'Premium desde Google Play y recorrido corregido':
    'Premium from Google Play and a fixed tour',
  'Si instalaste la app desde Google Play, ya puedes suscribirte a Premium dentro de la app (Configuración → Suscripción) y gestionarla desde Google Play. Los nuevos precios de Premium son $107 al mes o $1,037 al año en la web (Google Play muestra su propio precio con impuestos); quien ya está suscrito conserva su precio. También se corrigió el recorrido de bienvenida: siempre empieza por el saludo y termina con las secciones más nuevas.':
    'If you installed the app from Google Play, you can now subscribe to Premium inside the app (Settings → Subscription) and manage it from Google Play. The new Premium prices are $107 per month or $1,037 per year on the web (Google Play shows its own price with taxes); anyone already subscribed keeps their price. The welcome tour was also fixed: it now always starts with the greeting and ends with the newest sections.',
  'Las notificaciones te llevan al lugar correcto':
    'Notifications take you to the right place',
  'Al tocar "Movimiento pendiente por revisar" se abre Transacciones con ese movimiento resaltado, listo para confirmarlo. Los avisos de presupuesto abren Presupuestos. Además se arreglaron las vistas de Sincronizar correo y del panel de administración en el celular, los textos que no se leían en modo oscuro (Rendimientos, Resumen, Reportes, Suscripciones) y la app ya usa el logo nuevo como ícono.':
    'Tapping "Pending transaction to review" opens Transactions with that transaction highlighted, ready to confirm. Budget alerts open Budgets. We also fixed the Email Sync and admin panel views on mobile, the text that was unreadable in dark mode (Yields, Summary, Reports, Subscriptions), and the app now uses the new logo as its icon.',
  'Nueva sección "Preguntas frecuentes" en el menú, empezando por la captura por notificaciones: qué activar en tu teléfono (Xiaomi, Huawei, Oppo, Samsung…) para que registre tus cargos con la app cerrada, cómo se manejan los duplicados y qué hacer si algo no funciona.':
    'New "Frequently asked questions" section in the menu, starting with notification capture: what to enable on your phone (Xiaomi, Huawei, Oppo, Samsung…) so it records your charges with the app closed, how duplicates are handled and what to do if something doesn\'t work.',
  'Captura por notificaciones (Android)':
    'Notification capture (Android)',
  'Nueva sección "Captura por notificaciones": marca las apps de tu banco, wallet o tiendas y los cargos que te avisen se registran solos, aun con la app cerrada. Además, si el mismo cargo llega por notificación, SMS y correo ahora se registra una sola vez; si hay duda, se marca como "Posible duplicado" para que lo revises.':
    'New "Notification capture" section: select the apps of your bank, wallet or stores and the charges they notify you about are recorded on their own, even with the app closed. Also, if the same charge arrives by notification, SMS and email, it is now recorded only once; if in doubt, it is marked "Possible duplicate" for you to review.',
  'Tramos, apartados y rendimientos que sí contabilizan':
    'Tiers, pockets and yields that actually count',
  'En Cuentas, una cuenta con rendimiento ahora puede tener tramos por monto (ej. "primeros $50,000 a una tasa, el excedente a otra") y apartados con su propio saldo y tasa, como las cajitas. Además, "Verificar" en Rendimientos ya no es solo comparar: crea una transacción real de ingreso con la categoría "Rendimientos".':
    'In Accounts, an account with yield can now have tiers by amount (e.g. "first $50,000 at one rate, the rest at another") and pockets with their own balance and rate, like savings jars. Also, "Verify" in Yields is no longer just a comparison: it creates a real income transaction with the "Yields" category.',
  'Vista de tabla en Transacciones':
    'Table view in Transactions',
  'Alterna entre la vista de tarjetas y una vista de tabla compacta. Si un movimiento tiene subpartidas, haz clic para ver el detalle en una ventana superpuesta.':
    'Switch between card view and a compact table view. If a transaction has line items, click to see the details in a pop-up window.',
  'Subpartidas en tus transacciones':
    'Line items in your transactions',
  'Desglosa un gasto (ej. el ticket del súper) en líneas con su propio concepto, monto y categoría. La suma debe cuadrar exacto con el total, y los reportes por categoría ahora usan el detalle si lo capturaste. El OCR de recibos también intenta detectar las líneas del ticket.':
    'Break down an expense (e.g. a grocery receipt) into lines with their own description, amount and category. The sum must match the total exactly, and category reports now use the breakdown if you entered it. Receipt OCR also tries to detect the receipt\'s lines.',
  'Para suscripciones que no llegan por correo/SMS, activa "Generar el cargo automáticamente" y la app registrará el cargo sola cada ciclo. Las que sí llegan por correo/SMS ahora se confirman solas si ya estaban activas.':
    'For subscriptions that don\'t arrive by email/SMS, turn on "Generate the charge automatically" and the app will record the charge on its own each cycle. Those that do arrive by email/SMS are now confirmed automatically if they were already active.',
  'Nueva sección: sube el estado de cuenta (PDF o foto) de una tarjeta o cuenta y la app lo compara con tus movimientos registrados para detectar faltantes, sobrantes y montos distintos. Puedes agregar los faltantes con un clic.':
    'New section: upload the statement (PDF or photo) of a card or account and the app compares it with your recorded transactions to detect missing items, extra items and different amounts. You can add the missing ones with one click.',
  'Más monedas y conversión visible':
    'More currencies and visible conversion',
  'El selector de moneda ahora tiene buscador e incluye monedas de Latinoamérica (DOP, ARS, COP, CLP, PEN y más). En el historial, cada movimiento en otra moneda muestra su equivalente en tu moneda principal, y puedes filtrar por moneda.':
    'The currency selector now has a search box and includes Latin American currencies (DOP, ARS, COP, CLP, PEN and more). In the history, every transaction in another currency shows its equivalent in your main currency, and you can filter by currency.',
  'Panel de tarjeta pagada':
    'Paid card panel',
  'Cuando ya pagaste el periodo de una línea de crédito, ahora se muestra el gasto que llevas acumulado para el periodo siguiente en vez del saldo ya confirmado.':
    'Once you\'ve paid a credit line\'s period, the spending accumulated for the next period is now shown instead of the already confirmed balance.',
  'Tutorial guiado':
    'Guided tutorial',
  'Los usuarios nuevos ven un recorrido inicial por las secciones principales. Puedes volver a consultarlo en cualquier momento con el botón "?" de cada sección.':
    'New users see an initial tour of the main sections. You can revisit it at any time with the "?" button in each section.',
  Trimestral: 'Quarterly',
  Domingo: 'Sunday',
  Lunes: 'Monday',
  Martes: 'Tuesday',
  'Miércoles': 'Wednesday',
  Jueves: 'Thursday',
  Viernes: 'Friday',
  'Sábado': 'Saturday',
  'DD/MM/AAAA': 'DD/MM/YYYY',
  'MM/DD/AAAA': 'MM/DD/YYYY',
  'AAAA-MM-DD': 'YYYY-MM-DD',
  'AAAA/MM/DD': 'YYYY/MM/DD',
}
