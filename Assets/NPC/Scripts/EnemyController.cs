using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class EnemyController : MonoBehaviour
{
    public float detectionRadius = 5f;
    public float aggroRadius = 10f;
    public float moveRadius = 5f;
    public LayerMask playerLayer;

    protected Transform target;
    protected Vector3 homePosition; // Vihollisen ns. kotisijainti johon palata tarvittaessa
    protected enum State { Idle, Aggressive, ReturningHome }

    protected State currentState;
    private bool Home;
    protected Coroutine idleCoroutine;
    // protected float Speed;

    private static GameObject exclamationSprite;
    private float heightOffset = 2f;
    private float destroyDelay = 1f;

    private bool hasSpawnedSymbol = false;

    public virtual void Start()
    {
        homePosition = transform.position; // Asettaa kotisijainniksi sen koordinatin, mistä objekti aloittaa
        currentState = State.Idle;
        Home = true;
        // Speed = 2f;
    }

    private void Awake()
    {
        if (exclamationSprite == null)
        {
            exclamationSprite = Resources.Load<GameObject>("ExclamationMark");
        }
    }

    public virtual void Update()
    {
        switch (currentState)
        {
            case State.Idle:
                HandleIdleState();
                break;

            case State.Aggressive:
                HandleAggressiveState();
                break;

            case State.ReturningHome:
                HandleReturningHomeState();
                break;
        
        }
    }

    public virtual void HandleIdleState()
    {
        Collider2D player = Physics2D.OverlapCircle(transform.position, detectionRadius, playerLayer);

        // Mikäli pelaaja on havainnointialueella, aloita jahtaaminen
        if (player != null && player.transform.position.y <= transform.position.y + 0.5f)
        {

            if (!hasSpawnedSymbol)
            {
                SpawnSymbol();
                hasSpawnedSymbol = true;
            }

            if (idleCoroutine != null)
            {
                StopCoroutine(idleCoroutine);
                idleCoroutine = null;
            }
            
            target = player.transform;
            currentState = State.Aggressive;
        }
        else
        {
            if (idleCoroutine == null)
            {
                idleCoroutine = StartCoroutine(IdleMoving());
            }
            
        }
    }

    protected virtual void HandleAggressiveState()
    {
        Collider2D player = Physics2D.OverlapCircle(transform.position, detectionRadius, playerLayer);

        // Tarkistaa, onko vihollisobjekti liian kaukana kotipistettä, ja palaa sinne jos kyllä.
        if (Vector3.Distance(transform.position, homePosition) > aggroRadius)
        {
            currentState = State.ReturningHome;
            target = null;
            Home = false;

        }
        // Jos pelaaja on havainnointi alueella ja tarpeeksi lähellä kotipistettä, aloita jahtaaminen
        else if (player != null && Home == true)
        {

            if (!hasSpawnedSymbol)
            {
                SpawnSymbol();
                hasSpawnedSymbol = true;
            }

            target = player.transform;
            MoveTowardsTarget();
        }
        else
        {
            // Mikäli pelaajaa ei lähettyvivillä jahtaamisen jälkeen Esim. pelaaja karkasi, palaa kotiin
            currentState = State.ReturningHome;
        }

    }

    public virtual void HandleReturningHomeState()
    {
        Collider2D player = Physics2D.OverlapCircle(transform.position, detectionRadius, playerLayer);
        float distanceToHome = Vector3.Distance(transform.position, homePosition);

        // Sallii pelaajan uudelleen jahtaamisen, kunhan on hieman lähempänä kotia ensin.
        if (player != null && distanceToHome < 4f)
        {
            SpawnSymbol();
            target = player.transform;
            currentState = State.Aggressive;
            Home = true;
            return;
        }

        // Tarkistaa onko 0.3f alueella kotipistettä, jos ei, jatkaa matkaa kotia päin
        if (distanceToHome > 0.3f)
        {
            MoveTowardsHome();
        }
        else
        {
            currentState = State.Idle;
        }
    }

    // Funktio jolla mennä suorinta tietä target objektia päin, yleisesti pelaaja objekti.
    protected virtual void MoveTowardsTarget()
    {
        if (target == null) return;

        Vector2 TargetPosition = new Vector2(target.position.x, transform.position.y);
        transform.position = Vector2.MoveTowards(transform.position, TargetPosition, 2f * Time.deltaTime);
    }

    // Funktio jolla palata kotipistettä päin tarvittaessa
    protected virtual void MoveTowardsHome()
    {

        if (hasSpawnedSymbol)
        {
            hasSpawnedSymbol = false;
        }

        Vector2 homeTargetPosition = new Vector2(homePosition.x, homePosition.y);
        transform.position = Vector2.MoveTowards(transform.position, homeTargetPosition, 2f * Time.deltaTime);
    }

    protected virtual IEnumerator IdleMoving()
    {

        while (currentState == State.Idle)
        {
        // Arvo satunnainen x kordinaatti koti alueelta
        float randomX = Random.Range(homePosition.x - moveRadius, homePosition.x + moveRadius);
        Vector2 targetPosition = new Vector2(randomX, homePosition.y);

            while (Vector2.Distance(transform.position, targetPosition) > 0.1f)
            {
                transform.position = Vector2.MoveTowards(transform.position, targetPosition, 0.5f * Time.deltaTime);
                yield return null; // Odota seuraavaan frameen
            }

            // Odota hetki ennen uutta liikettä
            yield return new WaitForSeconds(Random.Range(1f, 3f)); // Odotusaika 1-3 sekuntia
        }
    }

    // Resettaa tason mikäli koskeettaa pelaajaa
    protected void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
            //Debug.Log("Ouch!");
        }
    }

    protected void SpawnSymbol()
    {
        if (exclamationSprite == null)
        {
            Debug.LogError("Symbol prefab is null");
            return;
        }

        // Luo uuden huuto merkki spriten ja asettaa sen kutsuvan objektin lapseksi, jotta se seuraisi objektia
        GameObject newSymbol = Instantiate(exclamationSprite, transform.position + Vector3.up * heightOffset, Quaternion.identity);
        newSymbol.transform.SetParent(transform);

        Destroy(newSymbol, destroyDelay);

    }


    // Piirtää visualisoinnin radiuksista
    // Punainen = Pelaajan havainnointi
    // Sininen = "Aggro" alue, eli kuinka kauas on sallittu lähtemään aloituspisteestä
    protected virtual void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);

        Gizmos.color = Color.blue;
        Gizmos.DrawWireSphere(transform.position, aggroRadius);
    }

}
